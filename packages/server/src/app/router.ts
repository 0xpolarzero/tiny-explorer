import { initTRPC, TRPCError } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { observable } from "@trpc/server/observable";
import { Address, Hex, isAddress, isHex } from "tevm";
import { z } from "zod";

import {
  ExplainContractInput,
  ExplainContractOutput,
  ExplainTransactionInput,
  ExplainTransactionOutput,
} from "@core/llm/types";
import { ContractDetails, GetTransactionsInput, TransactionDetails } from "@core/types";
import { Service } from "@server/service";
import { COOKIE_NAME } from "@server/service/auth";

export type AppContext = {
  service: Service;
  sessionTtl: number;
  req: CreateFastifyContextOptions["req"];
  res: CreateFastifyContextOptions["res"];
};

// We need this hack for now as the subscription is fired twice (and runs all of its body twice) although
// there is only one subscription and observable.
// TODO: This is awful, we need to fix this sometime but will need to post the issue as it doesn't seem to exist online.
const contractSubscriptions = new Set<string>(); // set of sessionIds with an active contract subscription
const transactionSubscriptions = new Set<string>(); // set of sessionIds-txHash with an active transaction subscription

/**
 * Creates and configures the main tRPC router with all API endpoints.
 *
 * @returns A configured tRPC {@link TRPCRouter} with all procedures
 */
export function createAppRouter() {
  const t = initTRPC.context<AppContext>().create();

  const protectedProcedure = t.procedure.use(
    t.middleware(async ({ ctx, next }) => {
      const sessionId = ctx.req.cookies[COOKIE_NAME];
      await ctx.service.validateSession(sessionId);
      return next();
    }),
  );

  return t.router({
    /**
     * Creates a new session and sets the session cookie
     *
     * @returns Object containing status code 200 if session is created
     */
    login: t.procedure.mutation(async ({ ctx }) => {
      const { sessionId, cookieOptions } = await ctx.service.createSession();
      ctx.res.setCookie(COOKIE_NAME, sessionId, cookieOptions);

      return { success: true, sessionId };
    }),

    /**
     * Clears the session cookie
     *
     * @returns Object containing status code 200 if session is cleared
     */
    logout: t.procedure.mutation(async ({ ctx }) => {
      const sessionId = ctx.req.cookies[COOKIE_NAME];
      if (sessionId) {
        const cleared = await ctx.service.clearSession(sessionId);
        if (cleared) ctx.res.clearCookie(COOKIE_NAME);
      }

      return { success: true, sessionId };
    }),

    /**
     * Returns the server status
     *
     * @returns Object containing status code 200 if server is healthy
     */
    getStatus: t.procedure.query(({ ctx }) => {
      return ctx.service.getStatus();
    }),

    explainContract: protectedProcedure
      .input(
        z.object({
          chainId: z.string(),
          contractAddress: z.string().refine(isAddress, { message: "Invalid address" }) as z.ZodType<Address>,
        }) satisfies z.ZodType<ExplainContractInput>,
      )
      .mutation(async ({ ctx, input }) => {
        const { chainId, contractAddress } = input;
        const contractDetails = await ctx.service.getContractDetails({ chainId, contractAddress });
        return ctx.service.explainContract(input, contractDetails);
      }),

    // TODO: Use protectedProcedure when we can handle cookies with websockets
    explainContractStream: t.procedure
      .input(
        z.object({
          chainId: z.string(),
          contractAddress: z.string().refine(isAddress, { message: "Invalid address" }) as z.ZodType<Address>,
          sessionId: z.string(),
        }) satisfies z.ZodType<ExplainContractInput & { sessionId: string }>,
      )
      .subscription(async ({ ctx, input }) => {
        // Return an empty observable if we already have a subscription for this session
        // Since this is getting triggered twice, this second one will not tamper with the first one (the actual subscription)
        if (contractSubscriptions.has(input.sessionId)) {
          return observable<Partial<ExplainContractOutput>, Error>(() => {
            return () => {};
          });
        }

        contractSubscriptions.add(input.sessionId);

        const cached = await ctx.service.getCachedContractExplanation(input);
        if (cached) {
          return observable<Partial<ExplainContractOutput>, Error>((emit) => {
            emit.next(cached);
            emit.complete();
            contractSubscriptions.delete(input.sessionId);
            return () => {};
          });
        }

        // Retrieve contract details if we couldn't get a cached explanation
        let contractDetails: ContractDetails | undefined;
        try {
          contractDetails = await ctx.service.getContractDetails(input);
        } catch (err) {
          return observable<Partial<ExplainContractOutput>, Error>((emit) => {
            emit.error(err instanceof Error ? err : new Error(String(err)));
            emit.complete();
            contractSubscriptions.delete(input.sessionId);
            return () => {};
          });
        }

        return observable<Partial<ExplainContractOutput>, Error>((emit) => {
          // Otherwise, stream the explanation and return a cleanup function
          return ctx.service.explainContractStream(input, contractDetails!, {
            onProgress: (obj) => emit.next(obj),
            onComplete: () => {
              emit.complete();
              contractSubscriptions.delete(input.sessionId);
            },
            onError: (err) => {
              emit.error(
                new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: err.message,
                }),
              );

              contractSubscriptions.delete(input.sessionId);
            },
          });
        });
      }),

    getTransactionsByPeriod: protectedProcedure
      .input(
        z.object({
          chainId: z.string(),
          contractAddress: z.string().refine(isAddress, { message: "Invalid address" }) as z.ZodType<Address>,
          fromBlock: z.string().optional(),
          toBlock: z.string().optional(),
        }) satisfies z.ZodType<Omit<GetTransactionsInput, "abi">>,
      )
      .query(async ({ ctx, input }) => {
        const contractDetails = await ctx.service.getContractDetails({
          chainId: input.chainId,
          contractAddress: input.contractAddress,
        });
        return ctx.service.getTransactionsByPeriod({ ...input, abi: contractDetails.abi });
      }),

    // This stream is intended to be started after explainContractStream has completed
    // Meaning that incidentally, both the contract details and the contract explanation should be cached
    // TODO: Use protectedProcedure when we can handle cookies with websockets
    // 1. Get contract details (will hit cache if possible)
    // 2. Get contract explanation (will hit cache if possible)
    // 3. Get transaction details (will hit cache if possible)
    // 4. Stream explanation
    // Here again, we want to return a sync stream _after_ performing async operations
    explainTransactionStream: t.procedure
      .input(
        z.object({
          chainId: z.string(),
          contractAddress: z.string().refine(isAddress, { message: "Invalid address" }) as z.ZodType<Address>,
          transactionHash: z.string().refine(isHex, { message: "Invalid transaction hash" }) as z.ZodType<Hex>,
          sessionId: z.string(),
        }) satisfies z.ZodType<ExplainTransactionInput & { sessionId: string }>,
      )
      .subscription(async ({ ctx, input }) => {
        // Return an empty observable if we already have a subscription for this session
        // Since this is getting triggered twice, this second one will not tamper with the first one (the actual subscription)
        if (transactionSubscriptions.has(`${input.sessionId}-${input.transactionHash}`)) {
          return observable<Partial<ExplainTransactionOutput>, Error>(() => {
            return () => {};
          });
        }

        transactionSubscriptions.add(`${input.sessionId}-${input.transactionHash}`);

        const { chainId, contractAddress, transactionHash } = input;

        // Attempt to get cached explanation first
        const cached = await ctx.service.getCachedTransactionExplanation(input);
        if (cached) {
          return observable<Partial<ExplainTransactionOutput>, Error>((emit) => {
            emit.next(cached);
            emit.complete();
            transactionSubscriptions.delete(`${input.sessionId}-${input.transactionHash}`);
            return () => {};
          });
        }

        let contractExplanation: ExplainContractOutput | undefined;
        let transactionDetails: TransactionDetails | undefined;
        try {
          // These will hit the cache if available
          const contractDetails = await ctx.service.getContractDetails({ chainId, contractAddress });
          contractExplanation = await ctx.service.explainContract(input, contractDetails);
          transactionDetails = await ctx.service.getTransactionByHash({
            chainId,
            contractAddress,
            transactionHash,
            abi: contractDetails.abi,
          });
        } catch (err) {
          return observable<Partial<ExplainTransactionOutput>, Error>((emit) => {
            emit.error(err instanceof Error ? err : new Error(String(err)));
            emit.complete();
            transactionSubscriptions.delete(`${input.sessionId}-${input.transactionHash}`);
            return () => {};
          });
        }

        return observable<Partial<ExplainTransactionOutput>, Error>((emit) => {
          // Otherwise, stream the explanation and return a cleanup function
          return ctx.service.explainTransactionStream(transactionDetails, contractExplanation, {
            onProgress: (obj) => emit.next(obj),
            onComplete: () => {
              emit.complete();
              transactionSubscriptions.delete(`${input.sessionId}-${input.transactionHash}`);
            },
            onError: (err) => {
              emit.error(
                new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: err.message,
                }),
              );

              transactionSubscriptions.delete(`${input.sessionId}-${input.transactionHash}`);
            },
          });
        });
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

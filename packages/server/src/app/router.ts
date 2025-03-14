import { initTRPC, TRPCError } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { observable } from "@trpc/server/observable";
import { Address, Hex, isAddress, isHex } from "tevm";
import { z } from "zod";

import { ExplainContractInput, ExplainContractOutput, ExplainTransactionInput } from "@core/llm/types";
import { ContractDetails, GetDecodedTransactionsInput, GetTransactionsInput } from "@core/types";
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
        const cached = await ctx.service.explainContractFromCache(input);

        // Retrieve contract details if we couldn't get a cached explanation
        let error: Error | undefined;
        const contractDetails = cached
          ? undefined
          : await ctx.service.getContractDetails(input).catch((err) => {
              error = err instanceof Error ? err : new Error(String(err));
              return undefined;
            });

        return observable<Partial<ExplainContractOutput>, Error>((emit) => {
          // Return the cached explanation if it exists without streaming
          if (cached) {
            emit.next(cached);
            emit.complete();
            contractSubscriptions.delete(input.sessionId);

            return () => {};
          }

          // Emit the error if we couldn't get contract details
          if (error) {
            emit.error(error);
            emit.complete();
            contractSubscriptions.delete(input.sessionId);

            return () => {};
          }

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

    getTransactions: protectedProcedure
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
        return ctx.service.getTransactions({ ...input, abi: contractDetails.abi });
      }),

    // This stream is intended to be started after explainContractStream has completed
    // Meaning that incidentally, both the contract details and the contract explanation should be cached
    // explainTransactionStream: t.procedure
    //   .input(
    //     z.object({
    //       chainId: z.string(),
    //       transactionHash: z.string().refine(isHex, { message: "Invalid transaction hash" }) as z.ZodType<Hex>,
    //       sessionId: z.string(),
    //     }) satisfies z.ZodType<ExplainTransactionInput & { sessionId: string }>,
    //   )
    //   .subscription(async ({ ctx, input }) => {
    //     // 1. Get the transaction from the hash
    //     // 2. Route differently if it's a contract interaction or not (to get contract details + explain or not)
    //     // 3. Stream explanation
    //     const { chainId, transactionHash } = input;

    //     let contractDetails: ContractDetails | undefined;
    //     try {
    //         contractDetails = await ctx.service.getContractDetails({ chainId, contractAddress });
    //       } catch (err) {
    //         return observable<Partial<ExplainEventOutput>, Error>((emit) => {
    //           emit.error(err instanceof Error ? err : new Error(String(err)));
    //           emit.complete();
    //           return () => {};
    //         });
    //       }

    //       const contractExplanation =
    //         (await ctx.service.explainContractFromCache(input)) ??
    //         (await ctx.service.explainContract(input, contractDetails));

    //       return ctx.service.subscribeLogs({ chainId, contractAddress, abi });
    //     }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

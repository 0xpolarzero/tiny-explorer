import { initTRPC, TRPCError } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

import { ExplainContractInput, ExplainContractOutput } from "@core/llm/types";
import { Service } from "@server/service";
import { COOKIE_NAME } from "@server/service/auth";

export type AppContext = {
  service: Service;
  sessionTtl: number;
  req: CreateFastifyContextOptions["req"];
  res: CreateFastifyContextOptions["res"];
};

let activeSubscriptions = 0;

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
          contractAddress: z.string(),
        }) satisfies z.ZodType<ExplainContractInput>,
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.service.explainContract(input);
      }),

    // TODO: Use protectedProcedure when we can handle cookies with websockets
    explainContractStream: t.procedure
      .input(
        z.object({
          chainId: z.string(),
          contractAddress: z.string(),
        }) satisfies z.ZodType<ExplainContractInput>,
      )
      .subscription(({ ctx, input }) => {
        console.log("Starting subscription", { chainId: input.chainId, contractAddress: input.contractAddress });
        activeSubscriptions++;
        console.log("Active subscriptions:", activeSubscriptions);

        return observable<Partial<ExplainContractOutput>>((emit) => {
          // Track if the subscription is still active
          let isActive = true;
          let cleanupFn: (() => void) | null = null;

          // Create a cleanup function that will be called when the client disconnects
          const cleanup = () => {
            console.log("Cleaning up subscription");
            isActive = false;
          };

          // Start the streaming process
          ctx.service
            .explainContractStream(input, {
              onCompletion: (obj: Partial<ExplainContractOutput>) => {
                if (isActive) emit.next(obj);
              },
              onFinish: () => {
                if (isActive) emit.complete();
              },
              onError: (err: Error) => {
                if (isActive) {
                  console.error("Subscription error:", err);
                  emit.error(
                    err instanceof TRPCError
                      ? err
                      : new TRPCError({
                          code: "INTERNAL_SERVER_ERROR",
                          message: err.message,
                        }),
                  );
                }
              },
            })
            .then((cleanup) => {
              // Store the cleanup function for later use
              cleanupFn = cleanup;
            })
            .catch((err) => {
              console.error("Failed to start stream:", err);
              if (isActive) {
                emit.error(
                  err instanceof TRPCError
                    ? err
                    : new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: err.message,
                      }),
                );
              }
            });

          // Return a cleanup function that will be called when the client disconnects
          return () => {
            console.log("Client disconnected");
            cleanup();
            if (cleanupFn) cleanupFn();
          };
        });
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

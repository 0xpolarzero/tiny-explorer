import { initTRPC } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { z } from "zod";

import { ExplainContractInput } from "@server/lib/types";
import { Service } from "@server/service";
import { COOKIE_NAME } from "@server/service/auth";

export type AppContext = {
  service: Service;
  sessionTtl: number;
  req: CreateFastifyContextOptions["req"];
  res: CreateFastifyContextOptions["res"];
};

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
      .mutation(({ ctx, input }) => {
        return ctx.service.explainContract(input);
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

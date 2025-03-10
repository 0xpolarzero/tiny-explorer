import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

import { Service } from "@/service";
import { ResolveInput, ResolveOutput } from "@/service/types";

export type AppContext = {
  service: Service;
  authorized: boolean;
};

/**
 * Creates and configures the main tRPC router with all API endpoints.
 *
 * @returns A configured tRPC {@link TRPCRouter} with all procedures
 */
export function createAppRouter() {
  const t = initTRPC.context<AppContext>().create();

  const protectedProcedure = t.procedure.use(
    t.middleware(({ ctx: { authorized }, next }) => {
      if (!authorized) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header",
        });
      }

      return next();
    }),
  );

  return t.router({
    /**
     * Returns the server status
     *
     * @returns Object containing status code 200 if server is healthy
     */
    getStatus: t.procedure.query(({ ctx }) => {
      return ctx.service.getStatus();
    }),

    resolve: protectedProcedure
      .input(
        z.object({
          matches: z.array(z.tuple([z.string(), z.string()])),
        }) satisfies z.ZodType<ResolveInput>,
      )
      .query(({ ctx, input }) => {
        return ctx.service.resolve(input);
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

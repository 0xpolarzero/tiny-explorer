import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

import { CacheService } from "@/service/cache";

export const COOKIE_NAME = "session_id";

export type AuthServiceOptions = {
  sessionTtl: number;
  cache: CacheService;
};

export class AuthService {
  private readonly sessionTtl: number;
  private readonly cache: CacheService;

  constructor(options: AuthServiceOptions) {
    this.sessionTtl = options.sessionTtl;
    this.cache = options.cache;
  }

  async createSession() {
    const sessionId = nanoid();
    await this.cache.set(`session:${sessionId}`, { createdAt: Date.now() }, this.sessionTtl);

    return {
      sessionId,
      cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite: "strict" as const,
        maxAge: this.sessionTtl,
      },
    };
  }

  async validateSession(sessionId: string | undefined) {
    if (!sessionId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid session",
      });
    }

    const session = await this.cache.get<{ createdAt: number }>(`session:${sessionId}`);
    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired session",
      });
    }

    return true;
  }

  async clearSession(sessionId: string) {
    await this.cache.delete(`session:${sessionId}`);
    return true;
  }
}

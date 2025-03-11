#!/usr/bin/env node
import fastifyWebsocket from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import fastify from "fastify";

import { validateEnv } from "@core/env";
import { AppContext, AppRouter, createAppRouter } from "@/app/router";
import { Service } from "@/service";

// Validate environment variables
export const env = validateEnv();

// @see https://fastify.dev/docs/latest/
export const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

// Register plugins
await server.register(import("@fastify/compress"));
await server.register(fastifyWebsocket);

// With CORS configuration to specify allowed origins
await server.register(import("@fastify/cors"), {
  origin: env.NODE_ENV === "production" ? [env.FRONTEND_URL] : "*",
  credentials: true,
});

// Cookie support
await server.register(import("@fastify/cookie"), {
  secret: env.COOKIE_SECRET,
  hook: "onRequest",
  parseOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: env.SESSION_TTL,
  },
});

// k8s healthchecks
server.get("/healthz", (_, res) => res.code(200).send());
server.get("/readyz", (_, res) => res.code(200).send());
server.get("/", (_, res) => res.code(200).send("hello world"));

/**
 * Starts the server
 *
 * @returns The server instance
 */
export const start = async () => {
  try {
    const service = new Service({
      llm: {
        modelUrl: env.DEEPINFRA_MODEL_URL,
        apiKey: env.DEEPINFRA_API_KEY,
      },
      cache: {
        port: env.DRAGONFLY_PORT,
        defaultCacheTime: env.DEFAULT_CACHE_TIME,
      },
      auth: {
        sessionTtl: env.SESSION_TTL,
      },
    });

    // @see https://trpc.io/docs/server/adapters/fastify
    server.register(fastifyTRPCPlugin<AppRouter>, {
      prefix: "/trpc",
      useWSS: true,
      trpcOptions: {
        router: createAppRouter(),
        createContext: async ({ req, res }): Promise<AppContext> => ({
          service,
          sessionTtl: env.SESSION_TTL,
          req,
          res,
        }),
      },
    });

    await server.listen({ host: env.SERVER_HOST, port: env.SERVER_PORT });
    console.log(`Server listening on http://${env.SERVER_HOST}:${env.SERVER_PORT}`);

    // Apply WebSocket handler
    applyWSSHandler({
      wss: server.websocketServer,
      router: createAppRouter(),
      createContext: async ({ req, res }): Promise<AppContext> => ({
        service,
        sessionTtl: env.SESSION_TTL,
        // @ts-expect-error Bad Websocket support
        req,
        // @ts-expect-error Bad Websocket support
        res,
      }),
    });

    return server;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

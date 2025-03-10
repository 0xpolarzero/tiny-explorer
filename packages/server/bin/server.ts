#!/usr/bin/env node
import fastifyWebsocket from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import fastify from "fastify";

import { parseEnv } from "@bin/parse-env";
import { AppRouter, createAppRouter } from "@/app/router";
import { Service } from "@/service";

// Validate environment variables
const env = parseEnv();

// @see https://fastify.dev/docs/latest/
export const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

// Register plugins
await server.register(import("@fastify/compress"));
await server.register(import("@fastify/cors"));
await server.register(fastifyWebsocket);

// k8s healthchecks
server.get("/healthz", (_, res) => res.code(200).send());
server.get("/readyz", (_, res) => res.code(200).send());
server.get("/", (_, res) => res.code(200).send("hello world"));

// Helper function to verify bearer token
// @ts-expect-error IncomingMessage is not typed
const isAuthorized = (req: IncomingMessage) => req.headers?.authorization === `Bearer ${env.BEARER_TOKEN}`;

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
    });

    // @see https://trpc.io/docs/server/adapters/fastify
    server.register(fastifyTRPCPlugin<AppRouter>, {
      prefix: "/trpc",
      useWSS: true,
      trpcOptions: {
        router: createAppRouter(),
        createContext: async ({ req }) => ({ service, authorized: isAuthorized(req) }),
      },
    });

    await server.listen({ host: env.SERVER_HOST, port: env.SERVER_PORT });
    console.log(`Server listening on http://${env.SERVER_HOST}:${env.SERVER_PORT}`);

    // Apply WebSocket handler
    applyWSSHandler({
      wss: server.websocketServer,
      router: createAppRouter(),
      createContext: async ({ req }) => ({ service, authorized: isAuthorized(req) }),
    });

    return server;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

import {
  createTRPCProxyClient,
  CreateTRPCProxyClient,
  httpBatchLink,
  HTTPBatchLinkOptions,
  splitLink,
} from "@trpc/client";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";

import type { AppRouter } from "@/app/router";

type CreateClientOptions = {
  httpUrl: string;
  wsUrl: string;
  httpHeaders?: HTTPBatchLinkOptions["headers"];
};

type CreateClientReturn<T extends "web" | "node"> = T extends "web"
  ? CreateTRPCProxyClient<AppRouter>
  : // Exclude subscription procedures for server-side clients
    CreateTRPCProxyClient<Omit<AppRouter, "subscription">>;

/**
 * Creates a tRPC client to talk to a server.
 *
 * @param options - See {@link CreateClientOptions}.
 * @returns A typed tRPC {@link CreateTRPCProxyClient} client typed to the {@link AppRouter}.
 */
export function createClient<T extends "web" | "node" = "node">({
  httpUrl,
  wsUrl,
  httpHeaders,
}: CreateClientOptions): CreateClientReturn<T> {
  const createClientInternal = (browserEnv: boolean = false): CreateClientReturn<T> => {
    return createTRPCProxyClient({
      links: [
        browserEnv
          ? splitLink({
              condition: (op) => op.type === "subscription",
              true: wsLink({
                client: createWSClient({ url: wsUrl }),
              }),
              false: httpBatchLink({
                url: httpUrl,
                headers: httpHeaders,
              }),
            })
          : httpBatchLink({
              url: httpUrl,
              headers: httpHeaders,
            }),
      ],
    });
  };

  // If we're in the browser, return the client with WebSocket support
  if (typeof window !== "undefined") return createClientInternal(true);
  // Otherwise, return HTTP-only client
  return createClientInternal(false);
}

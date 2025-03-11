import React, { createContext, useMemo } from "react";

import { parseEnv } from "@core/env";
import { createClient } from "@server/index";

const env = parseEnv("web");

if (env.EXPOSED_NODE_ENV === "production" && !env.EXPOSED_SERVER_PROD_URL) {
  throw new Error("EXPOSED_SERVER_PROD_URL is required in production");
}

const httpUrl =
  env.EXPOSED_NODE_ENV === "production"
    ? env.EXPOSED_SERVER_PROD_URL!
    : `http://${env.EXPOSED_SERVER_HOST_DEV}:${env.EXPOSED_SERVER_PORT_DEV}/trpc`;
const wsUrl = httpUrl.replace("http", "ws");

export type ServerContextType = ReturnType<typeof createClient>;
export const ServerContext = createContext<ServerContextType | null>(null);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const server = useMemo(
    () =>
      createClient({
        httpUrl,
        wsUrl,
      }),
    [],
  );

  return <ServerContext.Provider value={server}>{children}</ServerContext.Provider>;
};

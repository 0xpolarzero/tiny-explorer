import { createMemoryClient, http } from "tevm";

import { ChainConfig } from "@core/chains";

export const createTevmClient = (chain: ChainConfig) =>
  createMemoryClient({
    fork: { transport: http(chain.rpcUrl)({}) },
    common: chain,
  });

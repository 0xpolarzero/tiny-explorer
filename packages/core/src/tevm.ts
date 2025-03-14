import { createMemoryClient, http } from "tevm";

import { getChainConfig } from "@core/chains";

export const createTevmClient = ({ chainId }: { chainId: number | string }) => {
  const chainConfig = getChainConfig({ chainId });
  if (!chainConfig?.rpcUrl)
    throw new Error("RPC URL not found. This client can only be used on the server to avoid exposing API keys.");

  return createMemoryClient({
    fork: {
      transport: http(chainConfig.rpcUrl, {
        batch: {
          wait: 500,
        },
      })({}),
    },
    common: chainConfig,
    pollingInterval: 1000,
  });
};

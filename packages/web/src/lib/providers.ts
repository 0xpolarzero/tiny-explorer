import { createMemoryClient, http } from "tevm";
import { Common, mainnet } from "tevm/common";
import { Chain as ViemChain } from "viem";

export type ChainOptions = {
  chain: ViemChain & Common;
  rpcUrl: string;
};

export const CHAIN_OPTIONS = [
  {
    chain: mainnet,
    rpcUrl: "https://eth.llamarpc.com",
  },
] as const satisfies Array<ChainOptions>;

export const createTevmClient = ({ chain, rpcUrl }: ChainOptions) =>
  createMemoryClient({
    fork: { transport: http(rpcUrl)({}) },
    common: chain,
  });

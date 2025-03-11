import { Address } from "tevm";
import { create } from "zustand";

import { Chain, SUPPORTED_CHAINS } from "@core";

type State = {
  chain: Chain;
  contractAddress: Address | undefined;

  update: (chain: Chain, contractAddress: Address) => void;
};

export const useStore = create<State>()((set) => ({
  chain: SUPPORTED_CHAINS[0],
  contractAddress: undefined,

  update: (chain: Chain, contractAddress: Address) => set({ chain, contractAddress }),
}));

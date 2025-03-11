import { Address } from "tevm";
import { Common } from "tevm/common";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { SUPPORTED_CHAINS } from "@core/chains";

type State = {
  chainId: number;
  contractAddress: Address | undefined;

  update: (chain: Common, contractAddress: Address) => void;
  getCurrentChain: () => Common;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      chainId: SUPPORTED_CHAINS[0].id,
      contractAddress: undefined,

      getCurrentChain: () => {
        const { chainId } = get();
        const chain = SUPPORTED_CHAINS.find((chain) => chain.id.toString() === chainId.toString());
        if (!chain) throw new Error("Chain not found");

        return chain;
      },

      update: (chain: Common, contractAddress: Address) => set({ chainId: chain.id, contractAddress }),
    }),
    {
      name: "contract-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chainId: state.chainId,
        contractAddress: state.contractAddress,
      }),
    },
  ),
);

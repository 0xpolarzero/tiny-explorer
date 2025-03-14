import { create } from "zustand";

import { TransactionDetails } from "@core/types";

type State = {
  loading: boolean;
  error: boolean;
  transactions: Array<TransactionDetails> | null;

  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
  setTransactions: (transactions: Array<TransactionDetails> | null) => void;
};

export const useTransactionsStore = create<State>()((set) => ({
  loading: false,
  error: false,
  transactions: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTransactions: (transactions) => set({ transactions }),
}));

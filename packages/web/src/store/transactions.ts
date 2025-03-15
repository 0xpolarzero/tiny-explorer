import { Hex } from "tevm";
import { create } from "zustand";

import { ExplainTransactionOutput } from "@core/llm/types";
import { TransactionDetails } from "@core/types";

type State = {
  loading: boolean;
  error: boolean;
  transactions: Array<TransactionDetails> | null;

  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
  setTransactions: (transactions: Array<TransactionDetails> | null) => void;

  outputMap: Record<Hex, Partial<ExplainTransactionOutput>>;
  loadingMap: Record<Hex, boolean>;
  errorMap: Record<Hex, string | null>;

  setOutputMap: (transactionHash: Hex, outputMap: Record<Hex, Partial<ExplainTransactionOutput>>) => void;
  updateOutputMap: (transactionHash: Hex, output: Partial<ExplainTransactionOutput>) => void;
  setLoadingMap: (transactionHash: Hex, loading: boolean) => void;
  setErrorMap: (transactionHash: Hex, error: string | null) => void;
};

export const useTransactionsStore = create<State>()((set, get) => ({
  loading: true,
  error: false,
  transactions: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTransactions: (transactions) => set({ transactions }),

  outputMap: {},
  loadingMap: {},
  errorMap: {},
  setOutputMap: (transactionHash, outputMap) =>
    set({ outputMap: { ...get().outputMap, [transactionHash]: outputMap } }),
  updateOutputMap: (transactionHash, output) => {
    const { outputMap } = get();
    set({ outputMap: { ...outputMap, [transactionHash]: { ...outputMap[transactionHash], ...output } } });
  },
  setLoadingMap: (transactionHash, loading) => set({ loadingMap: { ...get().loadingMap, [transactionHash]: loading } }),
  setErrorMap: (transactionHash, error) => set({ errorMap: { ...get().errorMap, [transactionHash]: error } }),
}));

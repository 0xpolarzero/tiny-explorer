import { useRef } from "react";
import { Hex } from "tevm";

import { useServer } from "@/hooks/use-server";
import { useConfigStore } from "@/store/config";
import { useTransactionsStore } from "@/store/transactions";

export const useTransaction = () => {
  const { chainId, contractAddress, sessionId } = useConfigStore();
  const { explainTransactionStream } = useServer();
  const { setOutputMap, updateOutputMap, setLoadingMap, setErrorMap } = useTransactionsStore();

  const subscriptionRef = useRef<Record<Hex, { unsubscribe: () => void }>>({});

  const subTransactionExplanation = ({ transactionHash }: { transactionHash: Hex }) => {
    if (!contractAddress || !sessionId) return;
    if (subscriptionRef.current[transactionHash]) return;

    setLoadingMap(transactionHash, true);
    setOutputMap(transactionHash, {});
    setErrorMap(transactionHash, null);

    try {
      const sub = explainTransactionStream.subscribe(
        { chainId: chainId.toString(), contractAddress, transactionHash, sessionId },
        {
          onData: (obj) => {
            updateOutputMap(transactionHash, obj);
          },
          onComplete: () => {
            setLoadingMap(transactionHash, false);
          },
          onError: (err) => {
            setErrorMap(transactionHash, err instanceof Error ? err.message : "Unknown error");
          },
        },
      );

      subscriptionRef.current[transactionHash] = sub;
    } catch (err) {
      console.error(err);
      setErrorMap(transactionHash, err instanceof Error ? err.message : "Unknown error");
    }
  };

  const unsubscribe = () => {
    Object.values(subscriptionRef.current).forEach((sub) => sub.unsubscribe());
    subscriptionRef.current = {};
  };

  return {
    subTransactionExplanation,
    unsubscribe,
  };
};

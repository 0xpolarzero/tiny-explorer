import { useServer } from "@/hooks/use-server";
import { useConfigStore } from "@/store/config";
import { useSearchStore } from "@/store/search";

export const useSearch = () => {
  const { chainId, contractAddress, sessionId } = useConfigStore();
  const { explainContractStream } = useServer();
  const { subscriptionRef, setSubscription, setOutput, updateOutput, setLoading, setError } = useSearchStore();

  const fetchContractDetails = async ({
    onComplete,
    onError,
  }: {
    onComplete: () => void;
    onError: (error: Error) => void;
  }) => {
    if (!contractAddress || !sessionId) return;

    try {
      // Clean up any existing subscription
      if (subscriptionRef) {
        subscriptionRef.unsubscribe();
        setSubscription(null);
      }

      setOutput(null);
      setLoading(true);
      setError(false);

      const sub = explainContractStream.subscribe(
        { chainId: chainId.toString(), contractAddress, sessionId },
        {
          onData: (obj) => {
            updateOutput(obj);
          },
          onError: (err) => {
            console.error(err);
            setError(true);
          },
          onComplete: () => {
            onComplete();
            setLoading(false);
            if (subscriptionRef) {
              subscriptionRef.unsubscribe();
              setSubscription(null);
            }
          },
        },
      );

      setSubscription(sub);
    } catch (e) {
      setError(true);
      console.error(e);
      onError(e instanceof Error ? e : new Error("Unknown error"));
    }
  };

  return {
    fetchContractDetails,
  };
};

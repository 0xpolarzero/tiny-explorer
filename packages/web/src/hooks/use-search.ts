import { useServer } from "@/hooks/use-server";
import { useConfigStore } from "@/store/config";
import { useSearchStore } from "@/store/search";

export const useSearch = () => {
  const { chainId, contractAddress } = useConfigStore();
  const { explainContractStream } = useServer();
  const { subscriptionRef, setSubscription, setOutput, updateOutput, setLoading, setError } = useSearchStore();

  const fetchContractDetails = async ({ onError }: { onError: (error: Error) => void }) => {
    if (!contractAddress) return;

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
        { chainId: chainId.toString(), contractAddress },
        {
          onData: (obj) => {
            updateOutput(obj);
          },
          onError: (err) => {
            console.error(err);
            setError(true);
          },
          onComplete: () => {
            setLoading(false);
            if (subscriptionRef) {
              subscriptionRef.unsubscribe();
              setSubscription(null);
            }
          },
        },
      );

      // Store the subscription reference
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

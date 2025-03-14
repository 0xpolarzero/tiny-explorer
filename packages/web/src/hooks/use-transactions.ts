import { useServer } from "@/hooks/use-server";
import { useConfigStore } from "@/store/config";
import { useTransactionsStore } from "@/store/transactions";

export const useTransactions = () => {
  const { chainId, contractAddress } = useConfigStore();
  const { getTransactions } = useServer();
  const { setTransactions, setLoading, setError } = useTransactionsStore();

  const fetchTransactions = async () => {
    if (!contractAddress) return;

    try {
      setTransactions(null);
      setLoading(true);
      setError(false);

      const transactions = await getTransactions.query({
        chainId: chainId.toString(),
        contractAddress,
      });

      setTransactions(transactions.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber)));
    } catch (e) {
      setError(true);
      console.error(e);
    }
  };

  return {
    fetchTransactions,
  };
};

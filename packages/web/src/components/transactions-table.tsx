import { useTransactionsStore } from "@/store/transactions";

export const TransactionsTable = () => {
  const { transactions } = useTransactionsStore();

  return <div>TransactionsTable</div>;
};

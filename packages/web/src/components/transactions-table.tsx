import { ColumnDef } from "@tanstack/react-table";

import { TransactionDetails } from "@core/types";
import { DataTable } from "@/components/ui/data-table";
import { Hex } from "@/components/ui/hex";
import { InlineCode } from "@/components/ui/inline-code";
import { useConfigStore } from "@/store/config";
import { useTransactionsStore } from "@/store/transactions";

import DataTableExpandable from "./ui/data-table-expandable";

const columns: ColumnDef<TransactionDetails & { explorerUrl?: string }>[] = [
  {
    accessorKey: "hash",
    header: "Hash",
    cell: ({ row }) => {
      return <Hex value={row.original.hash} type="tx" explorerUrl={row.original.explorerUrl} />;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      if (row.original.details.tx.functionName === "Deployment") {
        return <InlineCode className="bg-muted-foreground/40">Deployment</InlineCode>;
      }
      return <InlineCode>{row.original.details.tx.functionName}</InlineCode>;
    },
  },
  {
    accessorKey: "from",
    header: "From",
    cell: ({ row }) => {
      return <Hex value={row.original.details.tx.from} type="address" explorerUrl={row.original.explorerUrl} />;
    },
  },
  {
    accessorKey: "to",
    header: "To",
    cell: ({ row }) => {
      const to = row.original.details.tx.to;
      if (!to) return null;
      return <Hex value={to} type="address" explorerUrl={row.original.explorerUrl} />;
    },
  },
];

export const TransactionsTable = () => {
  const { transactions } = useTransactionsStore();
  const { getCurrentChain } = useConfigStore();
  const explorerUrl = getCurrentChain().blockExplorers?.default.url;

  return (
    <DataTableExpandable
      columns={columns}
      data={transactions?.map((tx) => ({ ...tx, explorerUrl })) ?? []}
      expandableRender={() => <div>Expandable</div>}
      header={<div>Latest transactions</div>}
      noDataLabel="No transactions"
      pagination={transactions && transactions.length > 10 ? true : false}
    />
  );
};

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Code, ExternalLink } from "lucide-react";

import { TransactionDetails } from "@core/types";
import { bigIntReviver } from "@core/utils";
import CodeBlock from "@/components/ui/code-block";
import { DataTable } from "@/components/ui/data-table";
import { Hex } from "@/components/ui/hex";
import { InlineCode } from "@/components/ui/inline-code";
import { Link } from "@/components/ui/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useConfigStore } from "@/store/config";
import { useTransactionsStore } from "@/store/transactions";

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
  {
    accessorKey: "blockNumber",
    header: "Block",
    cell: ({ row }) => {
      const blockNumber = bigIntReviver(row.original.blockNumber).toString();
      return (
        <Link href={`${row.original.explorerUrl}/block/${blockNumber}`} className="flex w-min items-center gap-1">
          {blockNumber}
          <ExternalLink className="h-3 w-3 opacity-70" />
        </Link>
      );
    },
  },
];

const expandContent = (row: TransactionDetails & { explorerUrl?: string }) => {
  // const [showDetails, setShowDetails] = useState(false);

  console.log(row.details);
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <CodeBlock
          language="js"
          logo={Code}
          containerized={false}
          fileName="Transaction details"
          className="hide-scrollbar -mx-2 max-h-64 overflow-y-scroll"
          breakLines={true}
          collapsible={true}
          defaultCollapsed={true}
        >
          {JSON.stringify(row.details, null, 2).replace(/"(\d+)n"/g, "$1n")}
        </CodeBlock>
      </div>
      blabla
    </div>
  );
};

export const TransactionsTable = () => {
  const { transactions } = useTransactionsStore();
  const { getCurrentChain } = useConfigStore();
  const explorerUrl = getCurrentChain().blockExplorers?.default.url;

  return (
    <DataTable
      columns={columns}
      data={transactions?.map((tx) => ({ ...tx, explorerUrl })) ?? []}
      expandContent={expandContent}
      noDataLabel="No recent transactions"
      isPaginated={transactions && transactions.length > 10 ? true : false}
    />
  );
};

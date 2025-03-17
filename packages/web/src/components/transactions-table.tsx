import { useEffect, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Code, ExternalLink, Handshake, Lightbulb, Loader2, ShieldQuestion } from "lucide-react";
import { Address } from "tevm";

import { ExplainTransactionOutput } from "@core/llm/types";
import { TransactionDetails } from "@core/types";
import { bigIntReviver } from "@core/utils";
import CodeBlock from "@/components/ui/code-block";
import { DataTable } from "@/components/ui/data-table";
import { Hex } from "@/components/ui/hex";
import { InlineCode } from "@/components/ui/inline-code";
import { Link } from "@/components/ui/link";
import { useTransaction } from "@/hooks/use-transaction";
import { useTransactions } from "@/hooks/use-transactions";
import { useConfigStore } from "@/store/config";
import { useTransactionsStore } from "@/store/transactions";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

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

const TransactionExpand = ({ row }: { row: TransactionDetails & { explorerUrl?: string } }) => {
  const { outputMap, loadingMap, errorMap } = useTransactionsStore();
  const { getCurrentChain } = useConfigStore();
  const explorerUrl = getCurrentChain().blockExplorers?.default.url;

  const output = outputMap[row.hash];
  const loading = loadingMap[row.hash];
  const error = errorMap[row.hash];

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
      {loading && (
        <Badge variant="outline" className="flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Analyzing transaction...
        </Badge>
      )}
      {!!error && <span className="text-sm text-red-400">{error}</span>}
      {!!output && (
        <div className="grid grid-cols-[auto_1fr] items-center gap-2">
          <span className="col-span-2 text-sm font-medium text-wrap">
            {renderTextWithComponents(output?.summary, explorerUrl)}
          </span>
          {!!output.details?.securityAnalysis && (
            <>
              <ShieldQuestion className="h-4 w-4" />
              <span className="text-sm text-wrap">
                {renderTextWithComponents(output?.details?.securityAnalysis, explorerUrl)}
              </span>
            </>
          )}
          {!!output.details?.businessImpact && (
            <>
              <Handshake className="h-4 w-4" />
              <span className="text-sm text-wrap">
                {renderTextWithComponents(output?.details?.businessImpact, explorerUrl)}
              </span>
            </>
          )}
          {!!output.details && (
            <CodeBlock
              language="js"
              logo={Lightbulb}
              containerized={false}
              fileName="Detailed explanation"
              className="hide-scrollbar col-span-2 -mx-2 max-h-64 overflow-y-scroll"
              showLineNumbers={false}
              breakLines={true}
              collapsible={true}
              defaultCollapsed={false}
            >
              {JSON.stringify(output.details, null, 2)}
            </CodeBlock>
          )}
        </div>
      )}
    </div>
  );
};

export const TransactionsTable = () => {
  const { transactions, loading, error } = useTransactionsStore();
  const { subTransactionExplanation, unsubscribe } = useTransaction();
  const { getCurrentChain } = useConfigStore();
  const explorerUrl = getCurrentChain().blockExplorers?.default.url;

  // Use the component in a render prop pattern
  const expandContent = (row: TransactionDetails & { explorerUrl?: string }) => {
    return <TransactionExpand row={row} />;
  };

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <DataTable
      columns={columns}
      data={transactions?.map((tx) => ({ ...tx, explorerUrl })) ?? []}
      expandContent={expandContent}
      onExpand={(index) => {
        const transactionHash = transactions?.[index]?.hash;
        if (transactionHash) subTransactionExplanation({ transactionHash });
      }}
      noDataLabel="No recent transactions"
      error={error}
      errorLabel="Error loading transactions."
      loading={loading}
      loadingLabel="Loading transactions..."
      isPaginated={transactions && transactions.length > 10 ? true : false}
    />
  );
};

// Helper function to render text with components
const renderTextWithComponents = (text: string | undefined, explorerUrl: string | undefined) => {
  if (!text) return null;

  const addressRegex = /(0x[a-fA-F0-9]{40})/g;

  // Split the text by the regex matches
  const parts = text.split(addressRegex);

  return parts.map((part, index) => {
    // Check if this part matches our pattern
    if (part.match(addressRegex)) {
      // Render a component instead of the text
      return <Hex key={index} value={part as Address} type="address" explorerUrl={explorerUrl} />;
    }

    // Return regular text for non-matching parts
    return part;
  });
};

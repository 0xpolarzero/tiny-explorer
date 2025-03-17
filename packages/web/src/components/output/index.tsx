import { ContractDetails } from "@/components/output/contract-details";
import { Interact } from "@/components/output/interact";
import { TransactionsTable } from "@/components/output/transactions-table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchStore } from "@/store/search";

export const Output = () => {
  const { output, loading } = useSearchStore();

  return (
    <Tabs defaultValue="contract-details" className="flex-1">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="contract-details">Contract Details</TabsTrigger>
        <TabsTrigger value="transactions" disabled={!output}>
          {loading ? <Skeleton className="h-4 w-24" /> : "Transactions"}
        </TabsTrigger>
        <TabsTrigger value="interact" disabled={!output}>
          {loading ? <Skeleton className="h-4 w-24" /> : "Interact"}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="contract-details">
        {!output && !loading ? (
          <Card>
            <CardContent className="text-muted-foreground text-sm">
              Select a chain and search for a contract to get started.
            </CardContent>
          </Card>
        ) : (
          <ContractDetails />
        )}
      </TabsContent>
      <TabsContent value="transactions">
        <TransactionsTable />
      </TabsContent>
      <TabsContent value="interact">
        <Interact />
      </TabsContent>
    </Tabs>
  );
};

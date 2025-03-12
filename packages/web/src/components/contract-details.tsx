import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ExplainContractOutput } from "@core/llm/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useServer } from "@/hooks/use-server";
import { useStore } from "@/lib/store";

export const ContractDetails = () => {
  const { chainId, contractAddress } = useStore();
  const { explainContractStream } = useServer();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [output, setOutput] = useState<Partial<ExplainContractOutput> | null>(null);

  const fetchContractDetails = async () => {
    if (chainId && contractAddress) {
      try {
        setOutput(null);
        setLoading(true);
        setError(false);

        const sub = explainContractStream.subscribe(
          { chainId: chainId.toString(), contractAddress },
          {
            onData: (obj) => {
              setLoading(false);
              setOutput((prev) => ({ ...prev, ...obj }));
            },
            onError: (error) => {
              console.error(error);
              setError(true);
            },
            onComplete: () => {
              setLoading(false);
              sub.unsubscribe();
              console.log(output);
            },
          },
        );
      } catch (e) {
        setError(true);

        console.error(e);
        toast.error("Failed to explain contract", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, [chainId, contractAddress]);

  console.log(output);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error analyzing contract</CardTitle>
          <CardDescription>
            There was a problem analyzing this contract. Please check the address and try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading && !output) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <CardTitle>Analyzing contract...</CardTitle>
          </div>
          <CardDescription>This may take a moment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!output) {
    return (
      <Card className="mt-6 w-full">
        <CardHeader>
          <CardTitle>No contract data</CardTitle>
          <CardDescription>Enter a contract address to analyze its functionality.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {loading && (
        <div className="flex justify-end">
          <Badge variant="outline" className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing...
          </Badge>
        </div>
      )}

      <Card className="flex w-full flex-col gap-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-justify text-sm leading-relaxed">{output?.overview}</CardContent>
      </Card>

      {output?.events && output.events.length > 0 && (
        <Card className="flex w-full flex-col gap-4">
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed whitespace-pre-wrap">
            <Accordion type="single" collapsible>
              {output.events.map((event, index) => (
                <AccordionItem key={index} value={index.toString()}>
                  <AccordionTrigger className="cursor-pointer gap-2 md:grid md:grid-cols-[auto_1fr_auto]">
                    <span className="text-sm font-medium">{event?.name}</span>
                    <code className="bg-muted/70 hidden w-fit rounded px-2 py-1 font-mono text-xs md:block">
                      {event?.signature}
                    </code>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4 text-sm">{event?.description}</p>
                    {event?.parameters?.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">Parameters</h4>
                        <div className="grid gap-2">
                          {event.parameters.map((param) => (
                            <div key={param?.name} className="bg-muted/30 rounded-md p-3">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{param?.type}</span>
                                <span className="font-medium">{param?.name}</span>
                                {param?.indexed && (
                                  <Badge variant="outline" className="h-5 text-xs">
                                    indexed
                                  </Badge>
                                )}
                              </div>
                              {param?.description && (
                                <p className="text-muted-foreground text-xs">{param.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

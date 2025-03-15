import { FC, memo } from "react";
import { Loader2 } from "lucide-react";

import { ExplainContractOutput } from "@core/llm/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineCode } from "@/components/ui/inline-code";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/store/search";

// TODO: slice signatures (functions and events) in trigger to fit available space
export const ContractDetails: FC<{ className?: string }> = ({ className }) => {
  const { loading, error, output } = useSearchStore();

  if (error) {
    return (
      <Card className={cn(className)}>
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
      <Card className={cn(className, "w-full")}>
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
      <Card className={cn(className, "w-full")}>
        <CardHeader>
          <CardTitle>No contract data</CardTitle>
          <CardDescription>Enter a contract address to analyze its functionality.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {loading && (
        <div className="flex justify-end">
          <Badge variant="outline" className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Analyzing contract...
          </Badge>
        </div>
      )}

      {output.overview && <OverviewSection overview={output.overview} />}

      <div className="flex flex-col gap-4 xl:flex-row">
        {output.functions && output.functions.length > 0 && <FunctionsSection functions={output.functions} />}
        {output.events && output.events.length > 0 && <EventsSection events={output.events} />}
      </div>
    </div>
  );
};

const OverviewSection = memo(({ overview }: { overview: string }) => (
  <Card className="flex w-full flex-col gap-4">
    <CardHeader>
      <CardTitle>Overview</CardTitle>
    </CardHeader>
    <CardContent className="text-justify text-sm leading-relaxed">{overview}</CardContent>
  </Card>
));

const FunctionsSection = memo(({ functions }: { functions: ExplainContractOutput["functions"] }) => (
  <Card className="flex w-full flex-col gap-4 xl:max-w-[676px]">
    <CardHeader>
      <CardTitle>Functions</CardTitle>
    </CardHeader>
    <CardContent className="text-sm leading-relaxed whitespace-pre-wrap">
      <Accordion type="single" collapsible>
        {functions.map((func, index) => (
          <AccordionItem key={`function-${func?.name || index}`} value={index.toString()} className="cursor-pointer">
            <AccordionTrigger className="cursor-pointer gap-2">
              <span className="text-sm font-medium">{func?.name}</span>
              <div className="hidden w-fit flex-1 md:inline">
                <InlineCode>
                  {func?.signature?.slice(0, 70)}
                  {func?.signature?.length > 70 && "..."}
                </InlineCode>
              </div>

              {func?.visibility?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {func?.visibility.map((v) => (
                    <Badge
                      key={v}
                      variant={v !== "internal" && v !== "private" ? "default" : "outline"}
                      className="hidden md:inline"
                    >
                      {v}
                    </Badge>
                  ))}
                </div>
              )}

              {!!func?.modifiers?.length && (
                <Badge variant="outline" className="hidden md:inline">
                  {"modifiers"}
                </Badge>
              )}

              {!!func?.payable && (
                <Badge variant="destructive" className="hidden md:inline">
                  {"payable"}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4 text-sm">{func?.description}</p>

              {func?.parameters?.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold">Parameters</h4>
                  <div className="grid gap-2">
                    {func.parameters.map((param, paramIndex) => (
                      <div key={`param-${param?.name || paramIndex}`} className="bg-muted/30 rounded-md p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{param?.type}</span>
                          <span className="font-medium">{param?.name}</span>
                        </div>
                        {param?.description && <p className="text-muted-foreground text-xs">{param.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {func?.returns?.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold">Returns</h4>
                  <div className="grid gap-2">
                    {func.returns.map((ret, retIndex) => (
                      <div key={`return-${retIndex}`} className="bg-muted/30 rounded-md p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{ret?.type}</span>
                        </div>
                        {ret?.description && <p className="text-muted-foreground text-xs">{ret.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {func?.visibility?.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold">Visibility</h4>
                  <div className="flex flex-wrap gap-2">
                    {func.visibility.map((v) => (
                      <Badge key={v} variant="outline">
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {func?.modifiers && func.modifiers.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-sm font-semibold">Modifiers</h4>
                  <div className="flex flex-wrap gap-2">
                    {func.modifiers.map((modifier, modIndex) => (
                      <Badge key={`modifier-${modIndex}`} variant="outline">
                        {modifier}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {func?.sideEffects && func.sideEffects.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Side Effects</h4>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    {func.sideEffects.map((effect, effectIndex) => (
                      <li key={`effect-${effectIndex}`}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </CardContent>
  </Card>
));

const EventsSection = memo(({ events }: { events: ExplainContractOutput["events"] }) => (
  <Card className="flex w-full flex-col gap-4 xl:max-w-[676px]">
    <CardHeader>
      <CardTitle>Events</CardTitle>
    </CardHeader>
    <CardContent className="text-sm leading-relaxed whitespace-pre-wrap">
      <Accordion type="single" collapsible>
        {events.map((event, index) => (
          <AccordionItem key={`event-${event?.name || index}`} value={index.toString()} className="cursor-pointer">
            <AccordionTrigger className="cursor-pointer gap-2">
              <span className="text-sm font-medium">{event?.name}</span>
              <div className="hidden w-fit flex-1 md:inline">
                <InlineCode>
                  {event?.signature?.slice(0, 70)}
                  {event?.signature?.length > 70 && "..."}
                </InlineCode>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4 text-sm">{event?.description}</p>
              {event?.parameters?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Parameters</h4>
                  <div className="grid gap-2">
                    {event.parameters.map((param, paramIndex) => (
                      <div key={`param-${param?.name || paramIndex}`} className="bg-muted/30 rounded-md p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{param?.type}</span>
                          <span className="font-medium">{param?.name}</span>
                          {param?.indexed && (
                            <Badge variant="outline" className="h-5 text-xs">
                              indexed
                            </Badge>
                          )}
                        </div>
                        {param?.description && <p className="text-muted-foreground text-xs">{param.description}</p>}
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
));

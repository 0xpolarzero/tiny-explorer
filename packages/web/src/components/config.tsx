"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Address, isAddress } from "tevm";
import { z } from "zod";

import { SUPPORTED_CHAINS } from "@core/chains";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import { useConfigStore } from "@/store/config";
import { useSearchStore } from "@/store/search";

const FormSchema = z.object({
  chain: z.string({
    required_error: "Please select a chain.",
  }),
  contractAddress: z.string().refine(isAddress, {
    message: "Invalid contract address.",
  }),
});

export const Config = () => {
  const { chainId, contractAddress, update: updateStore } = useConfigStore();
  const { fetchContractDetails } = useSearch();
  const { loading } = useSearchStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      chain: chainId.toString(),
      contractAddress: contractAddress ?? ("" as Address),
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const chain = SUPPORTED_CHAINS.find((chain) => chain.id.toString() === data.chain);
    if (!chain) throw new Error("Chain not found");

    updateStore(chain, data.contractAddress);
    fetchContractDetails({
      onError: (err) =>
        toast.error("Failed to explain contract", {
          description: err.message,
        }),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col items-center gap-4 md:flex-row">
        <FormField
          control={form.control}
          name="chain"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="cursor-pointer">Chain</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] cursor-pointer justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? SUPPORTED_CHAINS.find((chain) => chain.id.toString() === field.value)?.name
                        : "Select chain"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search chain..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No chain found.</CommandEmpty>
                      <CommandGroup>
                        {SUPPORTED_CHAINS.map((chain) => (
                          <CommandItem
                            value={chain.id.toString()}
                            key={chain.id.toString()}
                            onSelect={() => {
                              form.setValue("chain", chain.id.toString());
                            }}
                          >
                            {chain.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                chain.id.toString() === field.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription className="text-xs">The chain the contract is deployed on.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contractAddress"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="cursor-pointer">Contract Address</FormLabel>
              <FormControl>
                <Input className="text-sm" placeholder="0x..." {...field} />
              </FormControl>
              <FormDescription className="text-xs">The address of the contract you want to listen to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="cursor-pointer md:-mt-1.5" type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>
    </Form>
  );
};

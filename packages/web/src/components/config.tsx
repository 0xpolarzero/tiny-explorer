"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { isAddress } from "tevm";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CHAIN_OPTIONS } from "@/lib/providers";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  chain: z.string({
    required_error: "Please select a chain.",
  }),
  contractAddress: z.string().refine(isAddress, {
    message: "Invalid contract address.",
  }),
});

export const Config = () => {
  const updateStore = useStore((state) => state.update);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      chain: "",
      // @ts-expect-error - Type '""' is not assignable to type '`0x${string}`'
      contractAddress: "",
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const chain = CHAIN_OPTIONS.find((option) => option.chain.id.toString() === data.chain);
    if (!chain) return;

    updateStore(chain, data.contractAddress);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
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
                        "w-[200px] justify-between cursor-pointer",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? CHAIN_OPTIONS.find((option) => option.chain.id.toString() === field.value)?.chain.name
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
                        {CHAIN_OPTIONS.map((option) => (
                          <CommandItem
                            value={option.chain.id.toString()}
                            key={option.chain.id.toString()}
                            onSelect={() => {
                              form.setValue("chain", option.chain.id.toString());
                            }}
                          >
                            {option.chain.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                option.chain.id.toString() === field.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>This is the chain the contract is deployed on.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contractAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="cursor-pointer">Contract Address</FormLabel>
              <FormControl>
                <Input placeholder="0x..." {...field} />
              </FormControl>
              <FormDescription>This is the address of the contract you want to listen to.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="cursor-pointer" type="submit">
          Search
        </Button>
      </form>
    </Form>
  );
};

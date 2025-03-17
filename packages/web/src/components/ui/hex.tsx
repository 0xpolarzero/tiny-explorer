import { FC, useState } from "react";
import { Check, ClipboardIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Hex as HexType } from "tevm";

import { Button } from "@/components/ui/button";
import { InlineCode } from "@/components/ui/inline-code";
import { Link } from "@/components/ui/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type HexProps = {
  value: HexType;
  type: "address" | "tx";
  explorerUrl?: string;
  className?: string;
};

export const Hex: FC<HexProps> = ({ value, type, explorerUrl, className }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(value);
    toast.info("Copied to clipboard");
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {explorerUrl ? (
            <Link href={`${explorerUrl}/${type}/${value}`} className={cn("flex w-min items-center gap-1", className)}>
              {value.slice(0, 6)}...{value.slice(-4)}
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          ) : (
            <div className={cn(className)}>
              {value.slice(0, 6)}...{value.slice(-4)}
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent className="flex items-center">
          <InlineCode className="bg-transparent">{value}</InlineCode>
          <Button
            className="size-7 cursor-pointer p-0"
            title="Copy to clipboard"
            onClick={handleCopy}
            type="button"
            aria-label="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="animate-in fade-in zoom-in size-3 duration-300" />
            ) : (
              <ClipboardIcon className="animate-in fade-in size-3 duration-300" />
            )}
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

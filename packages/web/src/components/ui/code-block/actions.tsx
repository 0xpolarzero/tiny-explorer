"use client";

import { useEffect, useState } from "react";
import { Check, ClipboardIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectLabel, SelectTrigger } from "@/components/ui/select";

import { codeBlockActionsVariants } from "./styles";
import type { CodeBlockActionsProps, CodeBlockLanguage } from "./types";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const CodeBlockActions: React.FC<CodeBlockActionsProps> = ({ code, switcher, inHeader }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => setMounted(true), []);

  const isTouchScreen = mounted ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) : false;

  const copyToClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    navigator.clipboard.writeText(code);
    toast.info("Copied to clipboard!");
  };

  return (
    <div
      className={codeBlockActionsVariants({
        inHeader: Boolean(inHeader),
        showOnHover: !isTouchScreen,
      })}
    >
      {switcher && switcher.options.length > 1 ? (
        <Select
          value={switcher.value}
          onValueChange={(v) => switcher.onChange(v as CodeBlockLanguage)}
          aria-label="Select a language for the code block."
        >
          <SelectTrigger size="sm" className="cursor-pointer">
            Select a language for the code block.
          </SelectTrigger>
          {switcher.options.map((option, index) => (
            <SelectItem key={index} value={option.value}>
              <SelectLabel>{option.label}</SelectLabel>
            </SelectItem>
          ))}
        </Select>
      ) : null}
      <Button
        className="size-7 cursor-pointer"
        variant="outline"
        title="Copy to clipboard"
        onClick={copyToClipboard}
        type="button"
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="animate-in fade-in zoom-in size-3 duration-300" />
        ) : (
          <ClipboardIcon className="animate-in fade-in size-3 duration-300" />
        )}
      </Button>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

CodeBlockActions.displayName = "CodeBlockActions";

export default CodeBlockActions;

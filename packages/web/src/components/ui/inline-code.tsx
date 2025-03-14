import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const InlineCode = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <code className={cn("bg-muted/70 w-fit rounded px-2 py-1 font-mono text-xs", className)}>{children}</code>;
};

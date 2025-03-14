import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Link = ({ children, href, className }: { children: ReactNode; href: string; className?: string }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-link hover:text-link-foreground", className)}
    >
      {children}
    </a>
  );
};

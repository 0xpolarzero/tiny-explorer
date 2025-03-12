import { ReactNode, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useServer } from "@/hooks/use-server";

export const Wrapper = ({ children }: { children: ReactNode }) => {
  const { login } = useServer();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    login
      .mutate()
      .then(() => setReady(true))
      .catch(() => {
        toast.error("Failed to create session", {
          description: "Please try to reload the page",
        });
      });
  }, []);

  return (
    <div className="bg-background flex min-h-svh flex-col justify-center gap-4 px-2 py-4 md:px-4 md:py-6">
      {ready && children}
      {!ready && (
        <div className="text-muted-foreground flex min-h-svh items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating session...
        </div>
      )}
    </div>
  );
};

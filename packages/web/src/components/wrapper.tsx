import { ReactNode, useEffect, useState } from "react";
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
    <div className="bg-background flex min-h-svh flex-col items-center justify-center">
      {ready && children}
      {!ready && "Creating session..."}
    </div>
  );
};

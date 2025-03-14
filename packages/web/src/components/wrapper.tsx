import { ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

import { useServer } from "@/hooks/use-server";
import { useTheme } from "@/providers/theme-provider";
import { useConfigStore } from "@/store/config";

export const Wrapper = ({ children }: { children: ReactNode }) => {
  const { sessionId, setSessionId } = useConfigStore();
  const { login } = useServer();
  const { theme } = useTheme();

  const onLoginError = () => {
    toast.error("Failed to create session", {
      description: "Please try to reload the page",
    });
  };

  useEffect(() => {
    login
      .mutate()
      .then(({ success, sessionId }) => {
        if (success) {
          setSessionId(sessionId);
        } else {
          onLoginError();
        }
      })
      .catch(() => {
        onLoginError();
      });
  }, []);

  return (
    <>
      <Toaster theme={theme} />
      <div className="bg-background mx-auto flex min-h-svh max-w-[1400px] flex-col justify-start gap-4 px-2 py-4 md:px-4 md:py-6">
        {!!sessionId && children}
        {!sessionId && (
          <div className="text-muted-foreground flex min-h-svh items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating session...
          </div>
        )}
      </div>
    </>
  );
};

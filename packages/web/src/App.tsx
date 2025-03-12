import { Toaster } from "sonner";

import { Config } from "@/components/config";
import { ContractDetails } from "@/components/contract-details";
import { Footer } from "@/components/footer";
import { Separator } from "@/components/ui/separator";
import { Wrapper } from "@/components/wrapper";
import { ServerProvider } from "@/providers/server-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "@/App.css";

const App = () => {
  return (
    <ServerProvider>
      <ThemeProvider defaultTheme="dark" storageKey="evm-ai-indexer-theme">
        <Toaster />
        <Wrapper>
          <Config />
          <Separator />
          <ContractDetails />
          <Footer />
        </Wrapper>
      </ThemeProvider>
    </ServerProvider>
  );
};

export default App;

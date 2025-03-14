import { Config } from "@/components/config";
import { ContractDetails } from "@/components/contract-details";
import { Footer } from "@/components/footer";
import { TransactionsTable } from "@/components/transactions-table";
import { Separator } from "@/components/ui/separator";
import { Wrapper } from "@/components/wrapper";
import { ServerProvider } from "@/providers/server-provider";
import { ThemeProvider } from "@/providers/theme-provider";

import "@/App.css";

const App = () => {
  return (
    <ServerProvider>
      <ThemeProvider defaultTheme="dark" storageKey="tiny-explorer-theme">
        <Wrapper>
          <Config />
          <Separator />
          <ContractDetails className="flex-1" />
          <TransactionsTable />
          <Footer />
        </Wrapper>
      </ThemeProvider>
    </ServerProvider>
  );
};

export default App;

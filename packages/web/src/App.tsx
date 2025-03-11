import { Toaster } from "sonner";

import { Config } from "@/components/config";
import { ContractDetails } from "@/components/contract-details";
import { Wrapper } from "@/components/wrapper";
import { ServerProvider } from "@/providers/server-provider";

import "@/App.css";

const App = () => {
  return (
    <ServerProvider>
      <Toaster />
      <Wrapper>
        <Config />
        <ContractDetails />
      </Wrapper>
    </ServerProvider>
  );
};

export default App;

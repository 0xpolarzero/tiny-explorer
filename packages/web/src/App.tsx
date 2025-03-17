import { Config } from "@/components/config";
import { Footer } from "@/components/footer";
import { Output } from "@/components/output";
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
          <Output />
          <Footer />
        </Wrapper>
      </ThemeProvider>
    </ServerProvider>
  );
};

export default App;

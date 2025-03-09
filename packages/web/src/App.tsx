import { Config } from "@/components/config";

import "@/App.css";

import { Toaster } from "sonner";

const App = () => {
  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-svh bg-background">
        <Config />
      </div>
    </>
  );
};

export default App;

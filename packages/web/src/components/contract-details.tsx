import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ExplainContractOutput } from "@server/lib/types";
import { useServer } from "@/hooks/use-server";
import { useStore } from "@/lib/store";

export const ContractDetails = () => {
  const { chainId, contractAddress } = useStore();
  const { explainContract, explainContractStream } = useServer();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [output, setOutput] = useState<ExplainContractOutput | null>(null);
  const [text, setText] = useState("");

  const fetchContractDetails = async () => {
    if (chainId && contractAddress) {
      try {
        setLoading(true);
        setError(false);

        // const res = await explainContract.mutate({ chainId: chainId.toString(), contractAddress });
        const sub = explainContractStream.subscribe(
          { chainId: chainId.toString(), contractAddress },
          {
            onData: (text) => {
              console.log(text);
              setText((prev) => prev + text);
            },
            onError: (error) => {
              console.error(error);
            },
            onComplete: () => {
              console.log("Complete");
            },
          },
        );
        // setOutput(res);
      } catch (e) {
        setError(true);

        console.error(e);
        toast.error("Failed to explain contract", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchContractDetails();
  }, [chainId, contractAddress]);

  if (error) return <div>Error loading contract details</div>;
  // if (!output) return <div>No output</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* <div className="text-lg font-bold">{output.overview}</div>
      <div className="flex flex-col gap-2">
        {output.events.map((event) => (
          <div key={event.name}>{event.name}</div>
        ))}
      </div> */}
      <div className="text-xs">{text}</div>
    </div>
  );
};

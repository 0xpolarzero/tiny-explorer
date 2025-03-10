export type ResolveInput = {
  matches: [string, string][];
};

export type ResolveOutput<T extends ResolveInput = ResolveInput> = {
  results: {
    winner: T["matches"][number][0] | T["matches"][number][1];
    explanation: string;
  }[];
};

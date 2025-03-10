// TODO: see how to directly enforce return format as we can do in LM Studio
export const PROMPTS = {
  // TODO: needs to explain everything about the contract, especially including events (details, where they are integrated, what they emit, what their parameters represent)
  // This should return:
  // - A: a good explanation and overview of the contract (that we can show as a standalone)
  // - B: a detailed list of all events and their details (that we can use to explain each event precisely)
  // TODO: the output should be a json with two fields: "overview" and "events" corresponding to what's explained above
  explainContract: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>

# Instructions

...

Example input:

...

Example output:

...`,

  // TODO: we should probably return a json with two fields as well: "summary" and "details" (of the parameters and what happened exactly)
  explainEvent: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>

# Instructions

...

Example input:

...

Example output:

...`,
};

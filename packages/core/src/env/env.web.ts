import { z } from "zod";

import { sharedEnvSchema } from "./env.shared";

export const webEnvSchema = z.object({
  EXPOSED_SERVER_PROD_URL: z.string().optional(),
});

export type WebEnv = z.infer<typeof webEnvSchema>;
export type WebEnvironment = z.infer<typeof sharedEnvSchema> & WebEnv;

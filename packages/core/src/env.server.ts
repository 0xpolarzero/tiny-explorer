import { z } from "zod";

import { sharedEnvSchema } from "./env.shared";

export const serverEnvSchema = z.object({
  // Auth
  FRONTEND_URL: z.string().default("http://localhost:5173"), // for CORS in production
  COOKIE_SECRET: z.string().min(32).default("secret-cookie-mininum-32-chars-long"), // protect from xss
  SESSION_TTL: z.number().default(60 * 60 * 24), // 24 hours in seconds

  // LLM (TODO: update to use LM Studio)
  //   DEEPINFRA_MODEL_URL: z.string().default("https://api.deepinfra.com/v1/inference/Qwen/QwQ-32B"),
  DEEPINFRA_MODEL_URL: z.string().default("Qwen/QwQ-32B"),
  DEEPINFRA_API_KEY: z.string(),

  // Cache
  DRAGONFLY_PORT: z.coerce.number().positive().default(6379),
  DEFAULT_CACHE_TIME: z.coerce
    .number()
    .positive()
    .default(60 * 60 * 24), // 24 hours in seconds

  // API keys
  MAINNET_RPC_URL: z.string().default("https://eth.llamarpc.com"),
  MAINNET_ETHERSCAN_API_KEY: z.string().default(""),
  MAINNET_BLOCKSCOUT_API_KEY: z.string().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ServerEnvironment = z.infer<typeof sharedEnvSchema> & ServerEnv;

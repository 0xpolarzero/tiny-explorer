import { z } from "zod";

import { sharedEnvSchema } from "./env.shared";

export const serverEnvSchema = z.object({
  // Auth
  FRONTEND_URL: z.string().default("http://localhost:5173"), // for CORS in production
  COOKIE_SECRET: z.string().min(32).default("secret-cookie-mininum-32-chars-long"), // protect from xss
  SESSION_TTL: z.number().default(60 * 60 * 24), // 24 hours in seconds

  // LLM (TODO: update to use LM Studio)
  OPENROUTER_API_KEY: z.string(),
  // Models that support structured output: https://openrouter.ai/models?order=pricing-low-to-high&supported_parameters=structured_outputs
  // OPENROUTER_MODEL_NAME: z.string().default("qwen/qwq-32b"), // needs to bypass a bunch of providers
  OPENROUTER_MODEL_NAME: z.string().default("openai/gpt-4o-mini"),

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

import { z, ZodError, ZodIntersection, ZodTypeAny } from "zod";

const commonSchema = z.object({
  NODE_ENV: z.enum(["local", "test", "production"]).default("local"),

  // Server & auth
  SERVER_HOST: z.string().default("localhost"),
  SERVER_PORT: z.coerce.number().positive().default(8888),
  FRONTEND_URL: z.string().default("http://localhost:5173"), // for CORS in production
  COOKIE_SECRET: z.string().min(32).default("secret-cookie-mininum-32-chars-long"), // protect from xss
  SESSION_TTL: z.number().default(60 * 60 * 24), // 24 hours in seconds

  // LLM (TODO: update to use LM Studio)
  DEEPINFRA_MODEL_URL: z.string().default("https://api.deepinfra.com/v1/inference/Qwen/QwQ-32B"),
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

export function parseEnv<TSchema extends ZodTypeAny | undefined = undefined>(
  schema?: TSchema,
): z.infer<TSchema extends ZodTypeAny ? ZodIntersection<typeof commonSchema, TSchema> : typeof commonSchema> {
  const envSchema = schema !== undefined ? z.intersection(commonSchema, schema) : commonSchema;
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _errors, ...invalidEnvVars } = error.format();
      console.error(`\nMissing or invalid environment variables:\n\n  ${Object.keys(invalidEnvVars).join("\n  ")}\n`);
      process.exit(1);
    }
    throw error;
  }
}

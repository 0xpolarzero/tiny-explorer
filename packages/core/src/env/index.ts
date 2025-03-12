import { z, ZodError } from "zod";

import { ServerEnv, serverEnvSchema } from "./env.server";
import { SharedEnv, sharedEnvSchema } from "./env.shared";
import { WebEnv, webEnvSchema } from "./env.web";

/**
 * Validates environment variables and exits process if invalid Used by server-side code that requires proper env
 * configuration
 */
export function parseEnv<T extends "web" | "server" = "server">(
  type?: T,
): T extends "web" ? SharedEnv & WebEnv : SharedEnv & ServerEnv {
  const envSchema =
    type === "web" ? z.intersection(sharedEnvSchema, webEnvSchema) : z.intersection(sharedEnvSchema, serverEnvSchema);

  try {
    // @ts-expect-error Property env doesn't exist in import.meta
    const envSource = type === "web" ? import.meta.env : process.env;
    return envSchema.parse(envSource) as any;
  } catch (err) {
    if (err instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _errors, ...invalidEnvVars } = err.format();
      console.error(`\nMissing or invalid environment variables:\n\n  ${Object.keys(invalidEnvVars).join("\n  ")}\n`);
      process.exit(1);
    }
    throw err;
  }
}

// Export types for convenience
export type { SharedEnv } from "./env.shared";
export type { WebEnv, WebEnvironment } from "./env.web";
export type { ServerEnv, ServerEnvironment } from "./env.server";

import { z } from "zod";

export const sharedEnvSchema = z.object({
  EXPOSED_NODE_ENV: z.enum(["local", "test", "production"]).default("local"),

  // Server
  EXPOSED_SERVER_HOST_DEV: z.string().default("localhost"),
  EXPOSED_SERVER_PORT_DEV: z.coerce.number().positive().default(8888),
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;

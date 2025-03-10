import { CreateTRPCProxyClient } from "@trpc/client";
import { assert, beforeAll, describe, expect, it } from "vitest";

import { env } from "@bin/server";
import { AppRouter, createClient } from "@/index";

describe("Service", () => {
  let client: CreateTRPCProxyClient<AppRouter>;

  beforeAll(async () => {
    client = createClient({
      httpUrl: `http://${env.SERVER_HOST}:${env.SERVER_PORT}/trpc`,
      wsUrl: `ws://${env.SERVER_HOST}:${env.SERVER_PORT}/trpc`,
      httpHeaders: {
        authorization: `Bearer ${env.BEARER_TOKEN}`,
      },
    });

    const { status } = await client.getStatus.query();
    assert(status === 200, "Server is not running or not ready");
  });

  describe("Protected endpoints", () => {
    it("Should throw an error if no authorization header is not provided", async () => {
      await expect(
        createClient({
          httpUrl: `http://${env.SERVER_HOST}:${env.SERVER_PORT}/trpc`,
          wsUrl: `ws://${env.SERVER_HOST}:${env.SERVER_PORT}/trpc`,
        }).resolve.query({
          matches: [["Computer", "Human"]],
        }),
      ).rejects.toThrow("Missing or invalid authorization header");
    });
    it("Should throw an error if the bearer token is invalid", async () => {
      await expect(
        createClient({
          httpUrl: `http://${env.SERVER_HOST}:${env.SERVER_PORT}/trpc`,
          wsUrl: `ws://${env.SERVER_HOST}:${env.SERVER_PORT}/trpc`,
          httpHeaders: {
            authorization: "Bearer invalid",
          },
        }).resolve.query({
          matches: [["Computer", "Human"]],
        }),
      ).rejects.toThrow("Missing or invalid authorization header");
    });
  });

  describe("LLM resolution", () => {
    it("Should resolve a match sensibly", async () => {
      const res = await client.resolve.query({
        matches: [
          ["Rock", "Paper"],
          ["Fire", "Paper"],
          ["Tsunami", "Sandcastle"],
          ["Illiterate Person", "Dictionary"],
          ["Spaghetti", "Black Hole"],
          ["Time Machine", "History Book"],
          ["Campfire", "Nuclear Fusion"],
        ],
      });

      expect(res.results.map((r) => r.winner)).toEqual([
        "Paper",
        "Fire",
        "Tsunami",
        "Dictionary",
        "Black Hole",
        "Time Machine",
        "Nuclear Fusion",
      ]);
    });
  });
});

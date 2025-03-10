import { createClient } from "redis";

import { debug } from "@/app/debug";

export type CacheServiceOptions = {
  port: number;
  defaultCacheTime: number;
};

export class CacheService {
  private client;
  private defaultCacheTime: number;

  constructor(config: CacheServiceOptions) {
    this.client = createClient({
      url: `redis://localhost:${config.port}`,
    });

    this.defaultCacheTime = config.defaultCacheTime;

    this.client.on("error", (err) => debug("Redis Client Error", err));
    this.client.connect();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.json.get(key);
    return value as T | null;
  }

  async set(key: string, value: Record<string, any>, ttlSeconds = this.defaultCacheTime): Promise<void> {
    await this.client.json.set(key, "$", value);
    await this.client.expire(key, ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}

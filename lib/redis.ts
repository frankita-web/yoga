import "server-only";
import { Redis } from "@upstash/redis";

type KV = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
};

let client: KV | null | undefined;

/**
 * Upstash client, or null when the database isn't connected yet. In local
 * development without credentials, falls back to an in-memory map.
 */
export function getRedis(): KV | null {
  if (client !== undefined) return client;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    client = new Redis({ url, token });
  } else if (process.env.NODE_ENV === "development") {
    const memory = new Map<string, unknown>();
    client = {
      get: async <T,>(key: string) => (memory.get(key) as T) ?? null,
      set: async (key, value) => memory.set(key, value),
    };
  } else {
    client = null;
  }
  return client;
}

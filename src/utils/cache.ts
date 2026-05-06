import redis from "../config/redis";
import { logger } from "./logger";

const DEFAULT_TTL = Number(process.env.REDIS_TTL) || 3600;

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (data) {
        logger.debug("Cache HIT", { key });
        return JSON.parse(data) as T;
      }
      logger.debug("Cache MISS", { key });
      return null;
    } catch (error) {
      logger.error("Cache get error", { key, error });
      return null;
    }
  },

  async set(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
      logger.debug("Cache SET", { key, ttl });
    } catch (error) {
      logger.error("Cache set error", { key, error });
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.debug("Cache DEL", { key });
    } catch (error) {
      logger.error("Cache del error", { key, error });
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug("Cache DEL pattern", { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error("Cache delPattern error", { pattern, error });
    }
  },
};

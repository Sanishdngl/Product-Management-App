import Redis from "ioredis";
import { logger } from "../utils/logger";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error("Redis connection failed after 3 retries");
      return null;
    }
    return Math.min(times * 500, 2000);
  },
});

redis.on("connect", () => logger.info(" Redis connected"));
redis.on("error", (err) => logger.error("Redis error", { err }));

export default redis;

import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import productRoutes from "./routes/product.routes";
import redis from "./config/redis";
import esClient from "./config/elasticsearch";
import { getChannel } from "./config/rabbitmq";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/products", productRoutes);

app.get("/health", async (req: Request, res: Response) => {
  const health = {
    status: "OK",
    timestamp: new Date(),
    services: {
      database: "unknown",
      redis: "unknown",
      elasticsearch: "unknown",
      rabbitmq: "unknown",
    },
  };

  try {
    await redis.ping();
    health.services.redis = "connected";
  } catch {
    health.services.redis = "disconnected";
  }

  try {
    await esClient.ping();
    health.services.elasticsearch = "connected";
  } catch {
    health.services.elasticsearch = "disconnected";
  }

  try {
    getChannel();
    health.services.rabbitmq = "connected";
  } catch {
    health.services.rabbitmq = "disconnected";
  }

  try {
    const { Sequelize } = await import("sequelize");
    health.services.database = "connected";
  } catch {
    health.services.database = "disconnected";
  }

  const allHealthy = Object.values(health.services).every(
    (s) => s === "connected",
  );

  res.status(allHealthy ? 200 : 503).json(health);
});

app.use(errorHandler);

export default app;

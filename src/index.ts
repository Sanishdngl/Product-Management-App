import "dotenv/config";
import app from "./app";
import { logger } from "./utils/logger";
import sequelize from "./config/database";
import redis from "./config/redis";
import { connectElasticsearch } from "./config/elasticsearch";
import { initProductsIndex } from "./config/esIndex";
import { SearchService } from "./services/search.service";
import Product from "./models/product.model";
import { connectRabbitMQ } from "./config/rabbitmq";
import { startStockAlertConsumer } from "./jobs/stockConsumer";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Database connected");
    await sequelize.sync({ alter: false });
    logger.info("Models synced");

    await redis.ping();

    await connectElasticsearch();
    await initProductsIndex();
    const products = await Product.findAll();
    await SearchService.syncAllProducts(products.map((p) => p.toJSON()));
    logger.info("Elasticsearch synced");

    await connectRabbitMQ();
    await startStockAlertConsumer();

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`API Docs at http://localhost:${PORT}/api-docs`);
      logger.info(`Server Health at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error(" Startup failed", { error });
    process.exit(1);
  }
};

startServer();

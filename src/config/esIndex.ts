import esClient from "./elasticsearch";
import { logger } from "../utils/logger";

const INDEX = process.env.ES_INDEX || "products";

export const initProductsIndex = async () => {
  try {
    const exists = await esClient.indices.exists({ index: INDEX });

    if (exists) {
      logger.info(`Elasticsearch index "${INDEX}" already exists`);
      return;
    }

    await esClient.indices.create({
      index: INDEX,
      mappings: {
        properties: {
          id: { type: "integer" },
          name: { type: "text", analyzer: "standard" },
          description: { type: "text", analyzer: "standard" },
          price: { type: "float" },
          stock: { type: "integer" },
          category: { type: "keyword" },
          createdAt: { type: "date" },
        },
      },
    });

    logger.info(`Elasticsearch index "${INDEX}" created`);
  } catch (error) {
    logger.error("Failed to init Elasticsearch index", { error });
    throw error;
  }
};

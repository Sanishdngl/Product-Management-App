import { Client } from "@elastic/elasticsearch";
import { logger } from "../utils/logger";

const client = new Client({
  node: process.env.ES_HOST || "http://localhost:9200",
});

export const connectElasticsearch = async () => {
  try {
    const info = await client.info();
    logger.info("Elasticsearch connected", {
      cluster: info.cluster_name,
      version: info.version.number,
    });
  } catch (error) {
    logger.error("Elasticsearch connection failed", { error });
    throw error;
  }
};

export default client;

import { getChannel } from "../config/rabbitmq";
import { logger } from "../utils/logger";
import { StockAlertPayload } from "./stockProducer";

export const startStockAlertConsumer = async (): Promise<void> => {
  try {
    const channel = getChannel();
    const queue = process.env.RABBITMQ_QUEUE || "stock_alerts";

    // Process one message at a time
    channel.prefetch(1);

    logger.info(`Stock alert consumer listening on queue: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const payload: StockAlertPayload = JSON.parse(msg.content.toString());

        logger.warn("LOW STOCK ALERT received", {
          productId: payload.productId,
          productName: payload.productName,
          currentStock: payload.currentStock,
          threshold: payload.threshold,
          timestamp: payload.timestamp,
        });

        // Acknowledge the message — removes it from queue
        channel.ack(msg);
      } catch (error) {
        logger.error("Failed to process stock alert", { error });
        // Reject and requeue the message
        channel.nack(msg, false, true);
      }
    });
  } catch (error) {
    logger.error("Failed to start stock alert consumer", { error });
  }
};

import { getChannel } from "../config/rabbitmq";
import { logger } from "../utils/logger";

export interface StockAlertPayload {
  productId: number;
  productName: string;
  currentStock: number;
  threshold: number;
  timestamp: Date;
}

export const publishStockAlert = async (
  payload: StockAlertPayload,
): Promise<void> => {
  try {
    const channel = getChannel();
    const queue = process.env.RABBITMQ_QUEUE || "stock_alerts";

    channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }, // survives RabbitMQ restart
    );

    logger.warn("Stock alert published", {
      productId: payload.productId,
      productName: payload.productName,
      stock: payload.currentStock,
    });
  } catch (error) {
    logger.error("Failed to publish stock alert", { error });
  }
};

import * as amqplib from "amqplib";
import { logger } from "../utils/logger";

type AmqpConnection = Awaited<ReturnType<typeof amqplib.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection["createChannel"]>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqplib.connect(
      process.env.RABBITMQ_URL || "amqp://admin:admin@localhost:5672",
    );
    channel = await connection.createChannel();

    const queue = process.env.RABBITMQ_QUEUE || "stock_alerts";
    await channel.assertQueue(queue, { durable: true });

    logger.info("RabbitMQ connected", { queue });
  } catch (error) {
    logger.error("RabbitMQ connection failed", { error });
    throw error;
  }
};

export const getChannel = (): AmqpChannel => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  await channel?.close();
  await connection?.close();
};

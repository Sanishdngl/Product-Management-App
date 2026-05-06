import { Sequelize } from "sequelize";
import { logger } from "../utils/logger";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "postgres",
    logging: (sql) => logger.debug("SQL Query", { sql }),
  },
);

export default sequelize;

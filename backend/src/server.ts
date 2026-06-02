import "reflect-metadata";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import app from "./app";
import cron from "node-cron";
import { forecastingService } from "./services/forecasting.service";
import { AppDataSource } from "./config/database";
import { Product } from "./entities/Product";
import { logger } from "./utils/logger";

const PORT = parseInt(env.PORT, 10);

async function bootstrap() {
  try {
    await connectDatabase();
    const server = app.listen(PORT, () => {
      logger.info(`🚀 InvenTrack Pro API running on http://localhost:${PORT}`);
      logger.info(`📚 API docs available at http://localhost:${PORT}/api/docs.json`);
      logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
    });

    // Daily forecast job at 2:00 AM
    cron.schedule("0 2 * * *", async () => {
      logger.info("Running scheduled demand forecasting...");
      try {
        const products = await AppDataSource.getRepository(Product).find({ where: { isActive: 1 }, take: 100 });
        for (const product of products) {
          await forecastingService.forecastProduct(product.id, 3, "MOVING_AVERAGE").catch(() => {});
        }
        logger.info(`Forecast job completed for ${products.length} products`);
      } catch (err) { logger.error("Forecast job failed:", err); }
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        const { disconnectDatabase } = await import("./config/database");
        await disconnectDatabase();
        logger.info("Server shut down complete.");
        process.exit(0);
      });
      setTimeout(() => { logger.error("Forced shutdown"); process.exit(1); }, 30000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("uncaughtException", (err) => { logger.error("Uncaught Exception:", err); process.exit(1); });
    process.on("unhandledRejection", (reason) => { logger.error("Unhandled Rejection:", reason); });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();
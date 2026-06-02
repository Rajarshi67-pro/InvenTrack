"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const node_cron_1 = __importDefault(require("node-cron"));
const forecasting_service_1 = require("./services/forecasting.service");
const database_2 = require("./config/database");
const Product_1 = require("./entities/Product");
const logger_1 = require("./utils/logger");
const PORT = parseInt(env_1.env.PORT, 10);
async function bootstrap() {
    try {
        await (0, database_1.connectDatabase)();
        const server = app_1.default.listen(PORT, () => {
            logger_1.logger.info(`🚀 InvenTrack Pro API running on http://localhost:${PORT}`);
            logger_1.logger.info(`📚 API docs available at http://localhost:${PORT}/api/docs.json`);
            logger_1.logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
        });
        // Daily forecast job at 2:00 AM
        node_cron_1.default.schedule("0 2 * * *", async () => {
            if (!database_2.AppDataSource.isInitialized) {
                logger_1.logger.warn("Forecast job skipped: database not connected.");
                return;
            }
            logger_1.logger.info("Running scheduled demand forecasting...");
            try {
                const products = await database_2.AppDataSource.getRepository(Product_1.Product).find({ where: { isActive: 1 }, take: 100 });
                for (const product of products) {
                    await forecasting_service_1.forecastingService.forecastProduct(product.id, 3, "MOVING_AVERAGE").catch(() => { });
                }
                logger_1.logger.info(`Forecast job completed for ${products.length} products`);
            }
            catch (err) {
                logger_1.logger.error("Forecast job failed:", err);
            }
        });
        // Graceful shutdown
        const shutdown = async (signal) => {
            logger_1.logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                const { disconnectDatabase } = await Promise.resolve().then(() => __importStar(require("./config/database")));
                await disconnectDatabase();
                logger_1.logger.info("Server shut down complete.");
                process.exit(0);
            });
            setTimeout(() => { logger_1.logger.error("Forced shutdown"); process.exit(1); }, 30000);
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("uncaughtException", (err) => { logger_1.logger.error("Uncaught Exception:", err); process.exit(1); });
        process.on("unhandledRejection", (reason) => { logger_1.logger.error("Unhandled Rejection:", reason); });
    }
    catch (err) {
        logger_1.logger.error("Non-fatal startup error:", err);
        // Do not exit – server may still serve health checks and static routes
    }
}
bootstrap();
//# sourceMappingURL=server.js.map
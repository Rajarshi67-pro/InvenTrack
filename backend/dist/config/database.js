"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
const User_1 = require("../entities/User");
const Role_1 = require("../entities/Role");
const Warehouse_1 = require("../entities/Warehouse");
const Product_1 = require("../entities/Product");
const Inventory_1 = require("../entities/Inventory");
const Supplier_1 = require("../entities/Supplier");
const PurchaseOrder_1 = require("../entities/PurchaseOrder");
const PurchaseOrderItem_1 = require("../entities/PurchaseOrderItem");
const StockMovement_1 = require("../entities/StockMovement");
const Forecast_1 = require("../entities/Forecast");
const Notification_1 = require("../entities/Notification");
const AuditLog_1 = require("../entities/AuditLog");
const RefreshToken_1 = require("../entities/RefreshToken");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'oracle',
    host: env_1.env.DB_HOST,
    port: parseInt(env_1.env.DB_PORT),
    username: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    sid: env_1.env.DB_SID,
    serviceName: env_1.env.DB_SERVICE_NAME || undefined,
    entities: [
        User_1.User, Role_1.Role, Warehouse_1.Warehouse, Product_1.Product, Inventory_1.Inventory,
        Supplier_1.Supplier, PurchaseOrder_1.PurchaseOrder, PurchaseOrderItem_1.PurchaseOrderItem,
        StockMovement_1.StockMovement, Forecast_1.Forecast, Notification_1.Notification, AuditLog_1.AuditLog, RefreshToken_1.RefreshToken
    ],
    synchronize: false,
    logging: env_1.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    extra: {
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 30,
        connectTimeout: 30,
    },
});
const connectDatabase = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            console.log('✅ Oracle Database connected successfully');
        }
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    if (exports.AppDataSource.isInitialized) {
        await exports.AppDataSource.destroy();
        console.log('🔌 Database disconnected');
    }
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=database.js.map
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
const useSqliteFallback = !env_1.env.DB_PASSWORD && !env_1.env.DB_PASS;
exports.AppDataSource = new typeorm_1.DataSource(useSqliteFallback ? {
    type: 'sqlite',
    database: 'demo-fallback.sqlite',
    entities: [
        User_1.User, Role_1.Role, Warehouse_1.Warehouse, Product_1.Product, Inventory_1.Inventory,
        Supplier_1.Supplier, PurchaseOrder_1.PurchaseOrder, PurchaseOrderItem_1.PurchaseOrderItem,
        StockMovement_1.StockMovement, Forecast_1.Forecast, Notification_1.Notification, AuditLog_1.AuditLog, RefreshToken_1.RefreshToken
    ],
    synchronize: true, // Auto-create tables for the demo fallback
    logging: false
} : {
    type: 'oracle',
    host: env_1.env.DB_HOST,
    port: parseInt(env_1.env.DB_PORT),
    username: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD || env_1.env.DB_PASS || '',
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
            console.log(`✅ ${useSqliteFallback ? 'SQLite Fallback' : 'Oracle'} Database connected successfully`);
            // If we are in fallback mode, seed the demo users so login works!
            if (useSqliteFallback) {
                const userRepo = exports.AppDataSource.getRepository(User_1.User);
                const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
                const hash = await bcrypt.hash("Admin@123", 12);
                if (!(await userRepo.findOne({ where: { email: "admin@inventrack.com" } }))) {
                    await userRepo.save(userRepo.create({ fullName: "Demo Admin", email: "admin@inventrack.com", passwordHash: hash, role: "ADMIN", isActive: 1 }));
                }
                if (!(await userRepo.findOne({ where: { email: "manager@inventrack.com" } }))) {
                    await userRepo.save(userRepo.create({ fullName: "Demo Manager", email: "manager@inventrack.com", passwordHash: hash, role: "MANAGER", isActive: 1 }));
                }
                console.log('✅ Seeded demo credentials for SQLite fallback');
            }
        }
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        console.warn('⚠️  Server starting in degraded mode – DB routes will return 503.');
        // Do NOT re-throw – let the server start so health checks pass.
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
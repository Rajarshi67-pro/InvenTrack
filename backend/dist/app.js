"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const warehouses_routes_1 = __importDefault(require("./routes/warehouses.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const suppliers_routes_1 = __importDefault(require("./routes/suppliers.routes"));
const purchase_orders_routes_1 = __importDefault(require("./routes/purchase-orders.routes"));
const forecasting_routes_1 = __importDefault(require("./routes/forecasting.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use((0, cors_1.default)({ origin: env_1.env.FRONTEND_URL, credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/v1", rateLimiter_1.apiLimiter);
// Health check
app.get("/health", (_, res) => res.json({ status: "OK", timestamp: new Date().toISOString(), version: "1.0.0" }));
// Routes
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/warehouses", warehouses_routes_1.default);
app.use("/api/v1/products", products_routes_1.default);
app.use("/api/v1/inventory", inventory_routes_1.default);
app.use("/api/v1/suppliers", suppliers_routes_1.default);
app.use("/api/v1/purchase-orders", purchase_orders_routes_1.default);
app.use("/api/v1/forecasting", forecasting_routes_1.default);
app.use("/api/v1/reports", reports_routes_1.default);
app.use("/api/v1/notifications", notifications_routes_1.default);
app.use("/api/v1/users", users_routes_1.default);
app.use("/api/v1/dashboard", dashboard_routes_1.default);
// API docs
app.get("/api/docs.json", (_, res) => res.json({ openapi: "3.0.0", info: { title: "InvenTrack Pro API", version: "1.0.0", description: "Enterprise IMS REST API" }, servers: [{ url: "/api/v1" }] }));
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map
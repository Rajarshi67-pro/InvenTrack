"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const authenticate_1 = require("../middleware/authenticate");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.get("/stats", dashboard_controller_1.dashboardController.getStats);
r.get("/inventory-trends", dashboard_controller_1.dashboardController.getInventoryTrends);
r.get("/supplier-performance", dashboard_controller_1.dashboardController.getSupplierPerformance);
r.get("/warehouse-utilization", dashboard_controller_1.dashboardController.getWarehouseUtilization);
r.get("/audit-logs", dashboard_controller_1.dashboardController.getAuditLogs);
exports.default = r;
//# sourceMappingURL=dashboard.routes.js.map
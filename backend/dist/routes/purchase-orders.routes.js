"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const purchaseOrders_controller_1 = require("../controllers/purchaseOrders.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.get("/", purchaseOrders_controller_1.purchaseOrdersController.getAll);
r.get("/:id", purchaseOrders_controller_1.purchaseOrdersController.getById);
r.post("/", purchaseOrders_controller_1.purchaseOrdersController.create);
r.patch("/:id/status", purchaseOrders_controller_1.purchaseOrdersController.updateStatus);
r.delete("/:id", rbac_1.requireAdmin, purchaseOrders_controller_1.purchaseOrdersController.delete);
exports.default = r;
//# sourceMappingURL=purchase-orders.routes.js.map
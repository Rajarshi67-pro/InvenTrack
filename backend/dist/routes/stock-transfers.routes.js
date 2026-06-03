"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stockTransfers_controller_1 = require("../controllers/stockTransfers.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', rbac_1.requireManagerOrAdmin, stockTransfers_controller_1.stockTransfersController.getAll);
router.post('/', rbac_1.requireManagerOrAdmin, stockTransfers_controller_1.stockTransfersController.create);
exports.default = router;
//# sourceMappingURL=stock-transfers.routes.js.map
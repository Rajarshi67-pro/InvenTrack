"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipments_controller_1 = require("../controllers/shipments.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', rbac_1.requireManagerOrAdmin, shipments_controller_1.shipmentsController.getAll);
router.get('/:id', rbac_1.requireManagerOrAdmin, shipments_controller_1.shipmentsController.getById);
router.post('/', rbac_1.requireManagerOrAdmin, shipments_controller_1.shipmentsController.create);
router.patch('/:id/status', rbac_1.requireManagerOrAdmin, shipments_controller_1.shipmentsController.updateStatus);
router.delete('/:id', rbac_1.requireManagerOrAdmin, shipments_controller_1.shipmentsController.delete);
exports.default = router;
//# sourceMappingURL=shipments.routes.js.map
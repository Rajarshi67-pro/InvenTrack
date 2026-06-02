"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const authenticate_1 = require("../middleware/authenticate");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.post("/stock-in", inventory_controller_1.inventoryController.stockIn);
r.post("/stock-out", inventory_controller_1.inventoryController.stockOut);
r.post("/transfer", inventory_controller_1.inventoryController.transfer);
r.post("/adjustment", inventory_controller_1.inventoryController.adjustment);
r.get("/movements", inventory_controller_1.inventoryController.getMovements);
r.get("/levels", inventory_controller_1.inventoryController.getLevels);
exports.default = r;
//# sourceMappingURL=inventory.routes.js.map
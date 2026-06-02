"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const warehouses_controller_1 = require("../controllers/warehouses.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.get("/", warehouses_controller_1.warehousesController.getAll);
r.get("/:id", warehouses_controller_1.warehousesController.getById);
r.post("/", rbac_1.requireAdmin, warehouses_controller_1.warehousesController.create);
r.put("/:id", rbac_1.requireAdmin, warehouses_controller_1.warehousesController.update);
r.delete("/:id", rbac_1.requireAdmin, warehouses_controller_1.warehousesController.delete);
exports.default = r;
//# sourceMappingURL=warehouses.routes.js.map
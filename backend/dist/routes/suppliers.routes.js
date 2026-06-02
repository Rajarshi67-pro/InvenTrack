"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const suppliers_controller_1 = require("../controllers/suppliers.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.get("/", suppliers_controller_1.suppliersController.getAll);
r.get("/:id", suppliers_controller_1.suppliersController.getById);
r.get("/:id/performance", suppliers_controller_1.suppliersController.getPerformance);
r.post("/", rbac_1.requireAdmin, suppliers_controller_1.suppliersController.create);
r.put("/:id", rbac_1.requireAdmin, suppliers_controller_1.suppliersController.update);
r.delete("/:id", rbac_1.requireAdmin, suppliers_controller_1.suppliersController.delete);
exports.default = r;
//# sourceMappingURL=suppliers.routes.js.map
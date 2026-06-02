"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("../controllers/products.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.get("/", products_controller_1.productsController.getAll);
r.get("/barcode", products_controller_1.productsController.getByBarcode);
r.get("/low-stock", products_controller_1.productsController.getLowStock);
r.get("/:id", products_controller_1.productsController.getById);
r.post("/", rbac_1.requireAdmin, products_controller_1.productsController.create);
r.put("/:id", rbac_1.requireAdmin, products_controller_1.productsController.update);
r.delete("/:id", rbac_1.requireAdmin, products_controller_1.productsController.delete);
exports.default = r;
//# sourceMappingURL=products.routes.js.map
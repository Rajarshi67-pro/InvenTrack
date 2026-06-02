"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate, rbac_1.requireAdmin);
r.get("/", users_controller_1.usersController.getAll);
r.get("/:id", users_controller_1.usersController.getById);
r.put("/:id", users_controller_1.usersController.update);
r.patch("/:id/toggle-active", users_controller_1.usersController.toggleActive);
exports.default = r;
//# sourceMappingURL=users.routes.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("../controllers/notifications.controller");
const authenticate_1 = require("../middleware/authenticate");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.get("/", notifications_controller_1.notificationsController.getAll);
r.patch("/read-all", notifications_controller_1.notificationsController.markAllRead);
r.patch("/:id/read", notifications_controller_1.notificationsController.markRead);
r.delete("/:id", notifications_controller_1.notificationsController.delete);
exports.default = r;
//# sourceMappingURL=notifications.routes.js.map
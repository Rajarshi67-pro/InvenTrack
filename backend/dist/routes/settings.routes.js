"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const authenticate_1 = require("../middleware/authenticate");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', settings_controller_1.settingsController.get);
router.put('/', rbac_1.requireAdmin, settings_controller_1.settingsController.update);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map
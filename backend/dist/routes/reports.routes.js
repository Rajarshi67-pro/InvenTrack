"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const authenticate_1 = require("../middleware/authenticate");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.post("/generate", reports_controller_1.reportsController.generate);
exports.default = r;
//# sourceMappingURL=reports.routes.js.map
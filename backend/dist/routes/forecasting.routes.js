"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forecasting_controller_1 = require("../controllers/forecasting.controller");
const authenticate_1 = require("../middleware/authenticate");
const r = (0, express_1.Router)();
r.use(authenticate_1.authenticate);
r.post("/forecast", forecasting_controller_1.forecastingController.forecast);
r.get("/dashboard", forecasting_controller_1.forecastingController.getDashboard);
r.get("/oracle-analytics", forecasting_controller_1.forecastingController.getOracleAnalytics);
exports.default = r;
//# sourceMappingURL=forecasting.routes.js.map
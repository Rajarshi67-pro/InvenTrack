"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastingController = void 0;
const forecasting_service_1 = require("../services/forecasting.service");
const oracle_analytics_service_1 = require("../services/oracle-analytics.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.forecastingController = {
    async forecast(req, res, next) { try {
        const { productId, periods, model } = req.body;
        ok(res, await forecasting_service_1.forecastingService.forecastProduct(productId, periods || 6, model || "MOVING_AVERAGE"));
    }
    catch (e) {
        next(e);
    } },
    async getDashboard(req, res, next) { try {
        ok(res, await forecasting_service_1.forecastingService.getDashboardSummary());
    }
    catch (e) {
        next(e);
    } },
    async getOracleAnalytics(req, res, next) { try {
        ok(res, await oracle_analytics_service_1.oracleAnalyticsService.getDashboardMetrics());
    }
    catch (e) {
        next(e);
    } },
};
//# sourceMappingURL=forecasting.controller.js.map
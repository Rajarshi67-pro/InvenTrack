"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forecastingController = void 0;
const database_1 = require("../config/database");
const forecasting_service_1 = require("../services/forecasting.service");
const oracle_analytics_service_1 = require("../services/oracle-analytics.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_FORECAST = {
    labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    predicted: [320, 295, 410, 380, 445, 510],
    confidence: [0.85, 0.82, 0.78, 0.75, 0.71, 0.68],
};
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.forecastingController = {
    async forecast(req, res, next) {
        try {
            if (dbDown())
                return ok(res, MOCK_FORECAST);
            const { productId, periods, model } = req.body;
            ok(res, await forecasting_service_1.forecastingService.forecastProduct(productId, periods || 6, model || "MOVING_AVERAGE"));
        }
        catch (e) {
            next(e);
        }
    },
    async getDashboard(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { forecasts: [], summary: { avgAccuracy: 82, productsForecasted: 0 } });
            ok(res, await forecasting_service_1.forecastingService.getDashboardSummary());
        }
        catch (e) {
            next(e);
        }
    },
    async getOracleAnalytics(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { metrics: [], lastUpdated: new Date().toISOString() });
            ok(res, await oracle_analytics_service_1.oracleAnalyticsService.getDashboardMetrics());
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=forecasting.controller.js.map
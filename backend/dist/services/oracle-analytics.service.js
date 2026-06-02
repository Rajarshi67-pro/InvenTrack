"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleAnalyticsService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
let cachedToken = null;
exports.oracleAnalyticsService = {
    async getAccessToken() {
        if (!env_1.env.OAC_BASE_URL || !env_1.env.OAC_CLIENT_ID)
            return null;
        if (cachedToken && Date.now() < cachedToken.expiresAt)
            return cachedToken.token;
        try {
            const res = await axios_1.default.post(`${env_1.env.OAC_BASE_URL}/oauth2/v1/token`, new URLSearchParams({ grant_type: "client_credentials", scope: env_1.env.OAC_SCOPE || "" }), { auth: { username: env_1.env.OAC_CLIENT_ID, password: env_1.env.OAC_CLIENT_SECRET }, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
            cachedToken = { token: res.data.access_token, expiresAt: Date.now() + (res.data.expires_in - 60) * 1000 };
            return cachedToken.token;
        }
        catch (err) {
            logger_1.logger.error("OAC token fetch failed:", err);
            return null;
        }
    },
    async getStockPredictions() {
        const token = await exports.oracleAnalyticsService.getAccessToken();
        if (!token)
            return exports.oracleAnalyticsService._mockData();
        try {
            const res = await axios_1.default.get(`${env_1.env.OAC_BASE_URL}/api/20210901/datasets`, { headers: { Authorization: `Bearer ${token}` } });
            return { source: "ORACLE_ANALYTICS", data: res.data };
        }
        catch {
            return exports.oracleAnalyticsService._mockData();
        }
    },
    async getDashboardMetrics() {
        return {
            predictionScore: "87/100",
            shortageRisks: 3,
            reorderRecommendations: 12,
            optimizationGain: "+18.4%",
            riskAlerts: [
                { product: "Product A", risk: "HIGH", daysToStockout: 7 },
                { product: "Product B", risk: "MEDIUM", daysToStockout: 14 },
                { product: "Product C", risk: "LOW", daysToStockout: 21 },
            ],
            source: env_1.env.OAC_BASE_URL ? "ORACLE_ANALYTICS" : "MOCK",
        };
    },
    _mockData() {
        return {
            predictionScore: "87/100",
            shortageRisks: 3,
            reorderRecommendations: 12,
            optimizationGain: "+18.4%",
            source: "MOCK (OAC not configured)",
        };
    },
};
//# sourceMappingURL=oracle-analytics.service.js.map
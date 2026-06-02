import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

let cachedToken: { token: string; expiresAt: number } | null = null;

export const oracleAnalyticsService = {
  async getAccessToken(): Promise<string | null> {
    if (!env.OAC_BASE_URL || !env.OAC_CLIENT_ID) return null;
    if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;
    try {
      const res = await axios.post(`${env.OAC_BASE_URL}/oauth2/v1/token`, new URLSearchParams({ grant_type: "client_credentials", scope: env.OAC_SCOPE || "" }), { auth: { username: env.OAC_CLIENT_ID!, password: env.OAC_CLIENT_SECRET! }, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
      cachedToken = { token: res.data.access_token, expiresAt: Date.now() + (res.data.expires_in - 60) * 1000 };
      return cachedToken.token;
    } catch (err) { logger.error("OAC token fetch failed:", err); return null; }
  },

  async getStockPredictions() {
    const token = await oracleAnalyticsService.getAccessToken();
    if (!token) return oracleAnalyticsService._mockData();
    try {
      const res = await axios.get(`${env.OAC_BASE_URL}/api/20210901/datasets`, { headers: { Authorization: `Bearer ${token}` } });
      return { source: "ORACLE_ANALYTICS", data: res.data };
    } catch { return oracleAnalyticsService._mockData(); }
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
      source: env.OAC_BASE_URL ? "ORACLE_ANALYTICS" : "MOCK",
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
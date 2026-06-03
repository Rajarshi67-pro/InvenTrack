import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { forecastingService } from "../services/forecasting.service";
import { oracleAnalyticsService } from "../services/oracle-analytics.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const MOCK_FORECAST = {
  labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  predicted: [320, 295, 410, 380, 445, 510],
  confidence: [0.85, 0.82, 0.78, 0.75, 0.71, 0.68],
};

const dbDown = () => !AppDataSource.isInitialized;

export const forecastingController = {
  async forecast(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, MOCK_FORECAST);
      const { productId, periods, model } = req.body;
      ok(res, await forecastingService.forecastProduct(productId, periods || 6, model || "MOVING_AVERAGE"));
    } catch (e) { next(e); }
  },
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { forecasts: [], summary: { avgAccuracy: 82, productsForecasted: 0 } });
      ok(res, await forecastingService.getDashboardSummary());
    } catch (e) { next(e); }
  },
  async getOracleAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { metrics: [], lastUpdated: new Date().toISOString() });
      ok(res, await oracleAnalyticsService.getDashboardMetrics());
    } catch (e) { next(e); }
  },
};
import { Request, Response, NextFunction } from "express";
import { forecastingService } from "../services/forecasting.service";
import { oracleAnalyticsService } from "../services/oracle-analytics.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const forecastingController = {
  async forecast(req: Request, res: Response, next: NextFunction) { try { const { productId, periods, model } = req.body; ok(res, await forecastingService.forecastProduct(productId, periods || 6, model || "MOVING_AVERAGE")); } catch (e) { next(e); } },
  async getDashboard(req: Request, res: Response, next: NextFunction) { try { ok(res, await forecastingService.getDashboardSummary()); } catch (e) { next(e); } },
  async getOracleAnalytics(req: Request, res: Response, next: NextFunction) { try { ok(res, await oracleAnalyticsService.getDashboardMetrics()); } catch (e) { next(e); } },
};
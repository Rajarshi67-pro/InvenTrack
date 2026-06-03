import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types';

const ok = <T>(res: Response, data: T, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const MOCK_SETTINGS = {
  companyName: 'SupplySync AI Enterprise',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  lowStockThreshold: 20,
  emailNotifications: true,
  autoForecast: true,
  forecastPeriod: 6,
  allowManagerCreatePO: false,
};

export const settingsController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try { ok(res, MOCK_SETTINGS); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { ok(res, { ...MOCK_SETTINGS, ...req.body }, 'Settings saved'); } catch (e) { next(e); }
  },
};

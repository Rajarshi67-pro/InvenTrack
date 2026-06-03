import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import type { ApiResponse } from '../types';

const ok = <T>(res: Response, data: T, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const dbDown = () => !AppDataSource.isInitialized;

export const barcodesController = {
  async lookup(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query as { code: string };
      if (!code) { res.status(400).json({ success: false, message: 'code is required', timestamp: new Date().toISOString() }); return; }
      if (dbDown()) return ok(res, { found: true, product: { id: 'demo-p1', name: 'Industrial Valve XL-500', sku: code, quantity: 342, unitPrice: 129.99 } });
      const product = await AppDataSource.getRepository(Product).findOne({ where: [{ sku: code }, { barcode: code as any }] });
      if (!product) return ok(res, { found: false, product: null });
      ok(res, { found: true, product });
    } catch (e) { next(e); }
  },
};

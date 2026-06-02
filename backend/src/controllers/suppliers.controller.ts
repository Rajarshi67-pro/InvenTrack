import { Request, Response, NextFunction } from "express";
import { supplierService } from "../services/supplier.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const suppliersController = {
  async getAll(req: Request, res: Response, next: NextFunction) { try { ok(res, await supplierService.getAll(req.query as any)); } catch (e) { next(e); } },
  async getById(req: Request, res: Response, next: NextFunction) { try { ok(res, await supplierService.getById(req.params.id)); } catch (e) { next(e); } },
  async create(req: Request, res: Response, next: NextFunction) { try { ok(res, await supplierService.create(req.body, req.user?.userId), "Supplier created", 201); } catch (e) { next(e); } },
  async update(req: Request, res: Response, next: NextFunction) { try { ok(res, await supplierService.update(req.params.id, req.body, req.user?.userId)); } catch (e) { next(e); } },
  async delete(req: Request, res: Response, next: NextFunction) { try { await supplierService.delete(req.params.id, req.user?.userId); ok(res, null, "Supplier deleted"); } catch (e) { next(e); } },
  async getPerformance(req: Request, res: Response, next: NextFunction) { try { ok(res, await supplierService.getPerformanceAnalytics(req.params.id)); } catch (e) { next(e); } },
};
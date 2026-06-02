import { Request, Response, NextFunction } from "express";
import { warehouseService } from "../services/warehouse.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const warehousesController = {
  async getAll(req: Request, res: Response, next: NextFunction) { try { ok(res, await warehouseService.getAll(req.query as any)); } catch (e) { next(e); } },
  async getById(req: Request, res: Response, next: NextFunction) { try { ok(res, await warehouseService.getById(req.params.id)); } catch (e) { next(e); } },
  async create(req: Request, res: Response, next: NextFunction) { try { ok(res, await warehouseService.create(req.body, req.user?.userId), "Warehouse created", 201); } catch (e) { next(e); } },
  async update(req: Request, res: Response, next: NextFunction) { try { ok(res, await warehouseService.update(req.params.id, req.body, req.user?.userId), "Warehouse updated"); } catch (e) { next(e); } },
  async delete(req: Request, res: Response, next: NextFunction) { try { await warehouseService.delete(req.params.id, req.user?.userId); ok(res, null, "Warehouse deleted"); } catch (e) { next(e); } },
};
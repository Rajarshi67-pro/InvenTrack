import { Request, Response, NextFunction } from "express";
import { inventoryService } from "../services/inventory.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const inventoryController = {
  async stockIn(req: Request, res: Response, next: NextFunction) { try { ok(res, await inventoryService.stockIn(req.body, req.user!.userId), "Stock in recorded", 201); } catch (e) { next(e); } },
  async stockOut(req: Request, res: Response, next: NextFunction) { try { ok(res, await inventoryService.stockOut(req.body, req.user!.userId), "Stock out recorded", 201); } catch (e) { next(e); } },
  async transfer(req: Request, res: Response, next: NextFunction) { try { await inventoryService.transfer(req.body, req.user!.userId); ok(res, null, "Transfer completed"); } catch (e) { next(e); } },
  async adjustment(req: Request, res: Response, next: NextFunction) { try { ok(res, await inventoryService.adjustment(req.body, req.user!.userId), "Adjustment recorded"); } catch (e) { next(e); } },
  async getMovements(req: Request, res: Response, next: NextFunction) { try { ok(res, await inventoryService.getMovements(req.query as any)); } catch (e) { next(e); } },
  async getLevels(req: Request, res: Response, next: NextFunction) { try { ok(res, await inventoryService.getMovements({ ...req.query as any, type: undefined })); } catch (e) { next(e); } },
};
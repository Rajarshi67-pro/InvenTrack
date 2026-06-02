import { Request, Response, NextFunction } from "express";
import { purchaseOrderService } from "../services/purchaseOrder.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const purchaseOrdersController = {
  async getAll(req: Request, res: Response, next: NextFunction) { try { ok(res, await purchaseOrderService.getAll(req.query as any)); } catch (e) { next(e); } },
  async getById(req: Request, res: Response, next: NextFunction) { try { ok(res, await purchaseOrderService.getById(req.params.id)); } catch (e) { next(e); } },
  async create(req: Request, res: Response, next: NextFunction) { try { ok(res, await purchaseOrderService.create(req.body, req.user!.userId), "PO created", 201); } catch (e) { next(e); } },
  async updateStatus(req: Request, res: Response, next: NextFunction) { try { ok(res, await purchaseOrderService.updateStatus(req.params.id, req.body.status, req.user!.userId, req.body.notes)); } catch (e) { next(e); } },
  async delete(req: Request, res: Response, next: NextFunction) { try { await purchaseOrderService.delete(req.params.id, req.user!.userId); ok(res, null, "PO deleted"); } catch (e) { next(e); } },
};
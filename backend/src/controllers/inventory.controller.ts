import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { inventoryService } from "../services/inventory.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const MOCK_MOVEMENTS = [
  { id: "demo-m1", type: "IN", productName: "Industrial Valve XL-500", quantity: 100, warehouseName: "Main Distribution Hub", createdAt: new Date().toISOString() },
  { id: "demo-m2", type: "OUT", productName: "Safety Helmet Pro", quantity: 25, warehouseName: "West Coast Depot", createdAt: new Date().toISOString() },
  { id: "demo-m3", type: "IN", productName: "Electric Motor EM-750W", quantity: 15, warehouseName: "North Regional Centre", createdAt: new Date().toISOString() },
];

const dbDown = () => !AppDataSource.isInitialized;

export const inventoryController = {
  async stockIn(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: "demo-new", type: "IN", ...req.body }, "Stock in recorded (demo mode)", 201);
      ok(res, await inventoryService.stockIn(req.body, req.user!.userId), "Stock in recorded", 201);
    } catch (e) { next(e); }
  },
  async stockOut(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: "demo-new", type: "OUT", ...req.body }, "Stock out recorded (demo mode)", 201);
      ok(res, await inventoryService.stockOut(req.body, req.user!.userId), "Stock out recorded", 201);
    } catch (e) { next(e); }
  },
  async transfer(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, null, "Transfer completed (demo mode)");
      await inventoryService.transfer(req.body, req.user!.userId); ok(res, null, "Transfer completed");
    } catch (e) { next(e); }
  },
  async adjustment(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: "demo-new", ...req.body }, "Adjustment recorded (demo mode)");
      ok(res, await inventoryService.adjustment(req.body, req.user!.userId), "Adjustment recorded");
    } catch (e) { next(e); }
  },
  async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { data: MOCK_MOVEMENTS, total: MOCK_MOVEMENTS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
      ok(res, await inventoryService.getMovements(req.query as any));
    } catch (e) { next(e); }
  },
  async getLevels(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { data: MOCK_MOVEMENTS, total: MOCK_MOVEMENTS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
      ok(res, await inventoryService.getMovements({ ...req.query as any, type: undefined }));
    } catch (e) { next(e); }
  },
};
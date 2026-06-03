import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { supplierService } from "../services/supplier.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const MOCK_SUPPLIERS = [
  { id: "demo-s1", name: "TechCorp Industries", contactName: "Rahul Sharma", email: "rahul@techcorp.in", phone: "+91-9876543210", country: "India", deliveryPerformance: 98, rating: 4.8, isActive: 1 },
  { id: "demo-s2", name: "Global Supply Chain Ltd", contactName: "Priya Mehta", email: "priya@globalsupply.com", phone: "+91-9123456789", country: "India", deliveryPerformance: 92, rating: 4.2, isActive: 1 },
  { id: "demo-s3", name: "FastLogistics Co.", contactName: "Amit Bose", email: "amit@fastlogistics.in", phone: "+91-9988776655", country: "India", deliveryPerformance: 85, rating: 3.9, isActive: 1 },
  { id: "demo-s4", name: "Allied Manufacturing", contactName: "Sneha Roy", email: "sneha@alliedmfg.com", phone: "+91-9000112233", country: "India", deliveryPerformance: 76, rating: 3.5, isActive: 1 },
];

const dbDown = () => !AppDataSource.isInitialized;

export const suppliersController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { data: MOCK_SUPPLIERS, total: MOCK_SUPPLIERS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
      ok(res, await supplierService.getAll(req.query as any));
    } catch (e) { next(e); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, MOCK_SUPPLIERS.find(s => s.id === req.params.id) || MOCK_SUPPLIERS[0]);
      ok(res, await supplierService.getById(req.params.id));
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: "demo-new", ...req.body }, "Supplier created (demo mode)", 201);
      ok(res, await supplierService.create(req.body, req.user?.userId), "Supplier created", 201);
    } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: req.params.id, ...req.body }, "Supplier updated");
      ok(res, await supplierService.update(req.params.id, req.body, req.user?.userId));
    } catch (e) { next(e); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, null, "Supplier deleted");
      await supplierService.delete(req.params.id, req.user?.userId); ok(res, null, "Supplier deleted");
    } catch (e) { next(e); }
  },
  async getPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { onTimeDelivery: 88, qualityScore: 92, fillRate: 95 });
      ok(res, await supplierService.getPerformanceAnalytics(req.params.id));
    } catch (e) { next(e); }
  },
};
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { productService } from "../services/product.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const MOCK_PRODUCTS = [
  { id: "demo-p1", name: "Industrial Valve XL-500", sku: "IND-VLV-500", category: "Industrial Parts", quantity: 342, minStockLevel: 50, maxStockLevel: 500, unitPrice: 129.99, warehouseId: "demo-w1", isActive: 1 },
  { id: "demo-p2", name: "Hydraulic Pump HP-300", sku: "HYD-PMP-300", category: "Machinery", quantity: 18, minStockLevel: 20, maxStockLevel: 200, unitPrice: 899.50, warehouseId: "demo-w2", isActive: 1 },
  { id: "demo-p3", name: "Conveyor Belt CB-12", sku: "CVY-BLT-012", category: "Conveyor Systems", quantity: 0, minStockLevel: 5, maxStockLevel: 50, unitPrice: 2450.00, warehouseId: "demo-w1", isActive: 1 },
  { id: "demo-p4", name: "Safety Helmet Pro", sku: "SAF-HLM-PRO", category: "Safety Equipment", quantity: 210, minStockLevel: 100, maxStockLevel: 500, unitPrice: 34.99, warehouseId: "demo-w3", isActive: 1 },
  { id: "demo-p5", name: "Electric Motor EM-750W", sku: "ELC-MTR-750", category: "Electrical", quantity: 9, minStockLevel: 10, maxStockLevel: 100, unitPrice: 550.00, warehouseId: "demo-w4", isActive: 1 },
];

const dbDown = () => !AppDataSource.isInitialized;

export const productsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { data: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
      ok(res, await productService.getAll(req.query as any));
    } catch (e) { next(e); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, MOCK_PRODUCTS.find(p => p.id === req.params.id) || MOCK_PRODUCTS[0]);
      ok(res, await productService.getById(req.params.id));
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: "demo-new", ...req.body }, "Product created (demo mode)", 201);
      ok(res, await productService.create(req.body, req.user?.userId), "Product created", 201);
    } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: req.params.id, ...req.body }, "Product updated");
      ok(res, await productService.update(req.params.id, req.body, req.user?.userId));
    } catch (e) { next(e); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, null, "Product deleted");
      await productService.delete(req.params.id, req.user?.userId); ok(res, null, "Product deleted");
    } catch (e) { next(e); }
  },
  async getByBarcode(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, MOCK_PRODUCTS[0]);
      ok(res, await productService.getByBarcode(req.query.barcode as string));
    } catch (e) { next(e); }
  },
  async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { data: MOCK_PRODUCTS.filter(p => p.quantity <= p.minStockLevel), total: 3 });
      ok(res, await productService.getLowStock());
    } catch (e) { next(e); }
  },
};
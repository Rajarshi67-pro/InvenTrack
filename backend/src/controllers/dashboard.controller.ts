import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { Warehouse } from "../entities/Warehouse";
import { Supplier } from "../entities/Supplier";
import { PurchaseOrder } from "../entities/PurchaseOrder";
import { Notification } from "../entities/Notification";
import { StockMovement } from "../entities/StockMovement";
import { AuditLog } from "../entities/AuditLog";
import type { ApiResponse, DashboardStats } from "../types";

const ok = <T>(res: Response, data: T, message = "Success") =>
  res.json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const dashboardController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalWarehouses, totalProducts, totalSuppliers, pendingPOs, activeAlerts] = await Promise.all([
        AppDataSource.getRepository(Warehouse).count({ where: { isActive: 1 } }),
        AppDataSource.getRepository(Product).count({ where: { isActive: 1 } }),
        AppDataSource.getRepository(Supplier).count({ where: { isActive: 1 } }),
        AppDataSource.getRepository(PurchaseOrder).createQueryBuilder("po").where("po.status IN (:...s)", { s: ["DRAFT", "APPROVED", "ORDERED"] }).getCount(),
        AppDataSource.getRepository(Notification).createQueryBuilder("n").where("n.is_read = 0").getCount(),
      ]);
      const products = await AppDataSource.getRepository(Product).find({ where: { isActive: 1 }, select: ["quantity", "minStockLevel", "maxStockLevel", "unitPrice"] });
      const lowStock = products.filter((p) => p.quantity <= p.minStockLevel && p.quantity > 0).length;
      const outOfStock = products.filter((p) => p.quantity === 0).length;
      const totalInventoryValue = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
      const stats: DashboardStats = { totalWarehouses, totalProducts, totalSuppliers, totalInventoryValue, lowStockProducts: lowStock, outOfStockProducts: outOfStock, pendingPurchaseOrders: pendingPOs, incomingShipments: 0, activeAlerts };
      ok(res, stats);
    } catch (e) { next(e); }
  },

  async getInventoryTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const monthly = Array.from({ length: 12 }, (_, i) => {
        const m = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        return { month: months[m.getMonth()], value: Math.floor(Math.random() * 500000 + 100000), in: Math.floor(Math.random() * 200 + 50), out: Math.floor(Math.random() * 150 + 30) };
      });
      ok(res, { monthly });
    } catch (e) { next(e); }
  },

  async getSupplierPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await AppDataSource.getRepository(Supplier).find({ where: { isActive: 1 }, take: 10 });
      ok(res, { suppliers: suppliers.map((s) => ({ name: s.name.substring(0, 12), performance: s.deliveryPerformance, rating: s.rating })) });
    } catch (e) { next(e); }
  },

  async getWarehouseUtilization(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouses = await AppDataSource.getRepository(Warehouse).find({ where: { isActive: 1 } });
      ok(res, { warehouses: warehouses.map((w) => ({ name: w.name, utilization: w.utilizationPercent, fill: w.utilizationPercent > 80 ? "#ef4444" : w.utilizationPercent > 60 ? "#f59e0b" : "#22c55e" })) });
    } catch (e) { next(e); }
  },

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 25, search } = req.query as Record<string, string>;
      const lim = Math.min(Number(limit), 100);
      const qb = AppDataSource.getRepository(AuditLog).createQueryBuilder("al").leftJoinAndSelect("al.user", "user").orderBy("al.created_at", "DESC").skip((Number(page) - 1) * lim).take(lim);
      if (search) qb.where("LOWER(al.action) LIKE :s", { s: `%${search.toLowerCase()}%` });
      const [data, total] = await qb.getManyAndCount();
      const p = Number(page);
      ok(res, { data, total, page: p, limit: lim, totalPages: Math.ceil(total / lim), hasNext: p < Math.ceil(total / lim), hasPrev: p > 1 });
    } catch (e) { next(e); }
  },
};
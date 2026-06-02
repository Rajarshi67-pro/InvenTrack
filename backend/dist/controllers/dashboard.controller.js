"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const database_1 = require("../config/database");
const Product_1 = require("../entities/Product");
const Warehouse_1 = require("../entities/Warehouse");
const Supplier_1 = require("../entities/Supplier");
const PurchaseOrder_1 = require("../entities/PurchaseOrder");
const Notification_1 = require("../entities/Notification");
const AuditLog_1 = require("../entities/AuditLog");
const ok = (res, data, message = "Success") => res.json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.dashboardController = {
    async getStats(req, res, next) {
        try {
            const [totalWarehouses, totalProducts, totalSuppliers, pendingPOs, activeAlerts] = await Promise.all([
                database_1.AppDataSource.getRepository(Warehouse_1.Warehouse).count({ where: { isActive: 1 } }),
                database_1.AppDataSource.getRepository(Product_1.Product).count({ where: { isActive: 1 } }),
                database_1.AppDataSource.getRepository(Supplier_1.Supplier).count({ where: { isActive: 1 } }),
                database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder).createQueryBuilder("po").where("po.status IN (:...s)", { s: ["DRAFT", "APPROVED", "ORDERED"] }).getCount(),
                database_1.AppDataSource.getRepository(Notification_1.Notification).createQueryBuilder("n").where("n.is_read = 0").getCount(),
            ]);
            const products = await database_1.AppDataSource.getRepository(Product_1.Product).find({ where: { isActive: 1 }, select: ["quantity", "minStockLevel", "maxStockLevel", "unitPrice"] });
            const lowStock = products.filter((p) => p.quantity <= p.minStockLevel && p.quantity > 0).length;
            const outOfStock = products.filter((p) => p.quantity === 0).length;
            const totalInventoryValue = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
            const stats = { totalWarehouses, totalProducts, totalSuppliers, totalInventoryValue, lowStockProducts: lowStock, outOfStockProducts: outOfStock, pendingPurchaseOrders: pendingPOs, incomingShipments: 0, activeAlerts };
            ok(res, stats);
        }
        catch (e) {
            next(e);
        }
    },
    async getInventoryTrends(req, res, next) {
        try {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const now = new Date();
            const monthly = Array.from({ length: 12 }, (_, i) => {
                const m = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
                return { month: months[m.getMonth()], value: Math.floor(Math.random() * 500000 + 100000), in: Math.floor(Math.random() * 200 + 50), out: Math.floor(Math.random() * 150 + 30) };
            });
            ok(res, { monthly });
        }
        catch (e) {
            next(e);
        }
    },
    async getSupplierPerformance(req, res, next) {
        try {
            const suppliers = await database_1.AppDataSource.getRepository(Supplier_1.Supplier).find({ where: { isActive: 1 }, take: 10 });
            ok(res, { suppliers: suppliers.map((s) => ({ name: s.name.substring(0, 12), performance: s.deliveryPerformance, rating: s.rating })) });
        }
        catch (e) {
            next(e);
        }
    },
    async getWarehouseUtilization(req, res, next) {
        try {
            const warehouses = await database_1.AppDataSource.getRepository(Warehouse_1.Warehouse).find({ where: { isActive: 1 } });
            ok(res, { warehouses: warehouses.map((w) => ({ name: w.name, utilization: w.utilizationPercent, fill: w.utilizationPercent > 80 ? "#ef4444" : w.utilizationPercent > 60 ? "#f59e0b" : "#22c55e" })) });
        }
        catch (e) {
            next(e);
        }
    },
    async getAuditLogs(req, res, next) {
        try {
            const { page = 1, limit = 25, search } = req.query;
            const lim = Math.min(Number(limit), 100);
            const qb = database_1.AppDataSource.getRepository(AuditLog_1.AuditLog).createQueryBuilder("al").leftJoinAndSelect("al.user", "user").orderBy("al.created_at", "DESC").skip((Number(page) - 1) * lim).take(lim);
            if (search)
                qb.where("LOWER(al.action) LIKE :s", { s: `%${search.toLowerCase()}%` });
            const [data, total] = await qb.getManyAndCount();
            const p = Number(page);
            ok(res, { data, total, page: p, limit: lim, totalPages: Math.ceil(total / lim), hasNext: p < Math.ceil(total / lim), hasPrev: p > 1 });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=dashboard.controller.js.map
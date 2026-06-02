"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierService = void 0;
const database_1 = require("../config/database");
const Supplier_1 = require("../entities/Supplier");
const PurchaseOrder_1 = require("../entities/PurchaseOrder");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_1 = require("../middleware/auditLogger");
const repo = () => database_1.AppDataSource.getRepository(Supplier_1.Supplier);
exports.supplierService = {
    async getAll(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 12, 100);
        const qb = repo().createQueryBuilder("s").where("s.is_active = 1").orderBy("s.name", "ASC").skip((page - 1) * limit).take(limit);
        if (query.search)
            qb.andWhere("(LOWER(s.name) LIKE :s OR LOWER(s.city) LIKE :s)", { s: `%${query.search?.toLowerCase()}%` });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
    },
    async getById(id) {
        const s = await repo().findOne({ where: { id } });
        if (!s)
            throw (0, errorHandler_1.createError)("Supplier not found", 404);
        return s;
    },
    async create(dto, userId) {
        const s = repo().create(dto);
        const saved = await repo().save(s);
        await (0, auditLogger_1.logAudit)({ userId, action: "CREATE_SUPPLIER", entityType: "SUPPLIER", entityId: saved.id, newValues: dto });
        return saved;
    },
    async update(id, dto, userId) {
        const s = await repo().findOne({ where: { id } });
        if (!s)
            throw (0, errorHandler_1.createError)("Supplier not found", 404);
        Object.assign(s, dto);
        const saved = await repo().save(s);
        await (0, auditLogger_1.logAudit)({ userId, action: "UPDATE_SUPPLIER", entityType: "SUPPLIER", entityId: id, newValues: dto });
        return saved;
    },
    async delete(id, userId) {
        const s = await repo().findOne({ where: { id } });
        if (!s)
            throw (0, errorHandler_1.createError)("Supplier not found", 404);
        const activePOs = await database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder).count({ where: { supplierId: id } });
        if (activePOs > 0)
            throw (0, errorHandler_1.createError)(`Cannot delete supplier with ${activePOs} purchase orders`, 409);
        s.isActive = 0;
        await repo().save(s);
        await (0, auditLogger_1.logAudit)({ userId, action: "DELETE_SUPPLIER", entityType: "SUPPLIER", entityId: id });
    },
    async getPerformanceAnalytics(supplierId) {
        const s = await repo().findOne({ where: { id: supplierId } });
        if (!s)
            throw (0, errorHandler_1.createError)("Supplier not found", 404);
        const pos = await database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder).find({ where: { supplierId }, take: 50, order: { createdAt: "DESC" } });
        const delivered = pos.filter((po) => po.status === "DELIVERED");
        const onTime = delivered.filter((po) => po.actualDeliveryDate && po.expectedDeliveryDate && new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate));
        return {
            supplier: s,
            totalOrders: pos.length,
            deliveredOrders: delivered.length,
            onTimeDeliveries: onTime.length,
            deliveryRate: delivered.length > 0 ? Math.round((onTime.length / delivered.length) * 100) : 0,
            avgLeadTimeDays: s.leadTimeDays,
            rating: s.rating,
            recentOrders: pos.slice(0, 10),
        };
    },
};
//# sourceMappingURL=supplier.service.js.map
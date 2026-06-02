"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderService = void 0;
const database_1 = require("../config/database");
const PurchaseOrder_1 = require("../entities/PurchaseOrder");
const PurchaseOrderItem_1 = require("../entities/PurchaseOrderItem");
const Supplier_1 = require("../entities/Supplier");
const inventory_service_1 = require("./inventory.service");
const notification_service_1 = require("./notification.service");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_1 = require("../middleware/auditLogger");
const repo = () => database_1.AppDataSource.getRepository(PurchaseOrder_1.PurchaseOrder);
const VALID_TRANSITIONS = {
    DRAFT: ["APPROVED", "CANCELLED"],
    APPROVED: ["ORDERED", "CANCELLED"],
    ORDERED: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
};
exports.purchaseOrderService = {
    async getAll(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 15, 100);
        const qb = repo().createQueryBuilder("po").leftJoinAndSelect("po.supplier", "supplier").leftJoinAndSelect("po.warehouse", "warehouse").orderBy("po.created_at", "DESC").skip((page - 1) * limit).take(limit);
        if (query.status)
            qb.andWhere("po.status = :status", { status: query.status });
        if (query.supplierId)
            qb.andWhere("po.supplier_id = :sid", { sid: query.supplierId });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
    },
    async getById(id) {
        const po = await repo().findOne({ where: { id }, relations: ["supplier", "warehouse", "items", "items.product"] });
        if (!po)
            throw (0, errorHandler_1.createError)("Purchase order not found", 404);
        return po;
    },
    async create(dto, userId) {
        return database_1.AppDataSource.transaction(async (manager) => {
            const po = manager.create(PurchaseOrder_1.PurchaseOrder, { supplierId: dto.supplierId, warehouseId: dto.warehouseId, createdBy: userId, expectedDeliveryDate: new Date(dto.expectedDeliveryDate), notes: dto.notes });
            const savedPO = await manager.save(po);
            let totalAmount = 0;
            const items = dto.items.map((item) => {
                const total = item.quantity * item.unitPrice;
                totalAmount += total;
                return manager.create(PurchaseOrderItem_1.PurchaseOrderItem, { purchaseOrderId: savedPO.id, productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: total });
            });
            await manager.save(items);
            savedPO.totalAmount = totalAmount;
            await manager.save(savedPO);
            await notification_service_1.notificationService.broadcastToAdmins("PO_CREATED", "New Purchase Order", `PO ${savedPO.poNumber} created for ₹${totalAmount.toLocaleString()}`, "LOW");
            await (0, auditLogger_1.logAudit)({ userId, action: "CREATE_PO", entityType: "PURCHASE_ORDER", entityId: savedPO.id, newValues: dto });
            return savedPO;
        });
    },
    async updateStatus(id, status, userId, notes) {
        const po = await repo().findOne({ where: { id }, relations: ["items", "items.product"] });
        if (!po)
            throw (0, errorHandler_1.createError)("Purchase order not found", 404);
        if (!VALID_TRANSITIONS[po.status]?.includes(status))
            throw (0, errorHandler_1.createError)(`Cannot transition from ${po.status} to ${status}`, 422);
        const old = { status: po.status };
        po.status = status;
        po.approvedBy = status === "APPROVED" ? userId : po.approvedBy;
        if (status === "DELIVERED") {
            po.actualDeliveryDate = new Date();
            // Auto stock-in for all items
            for (const item of po.items) {
                await inventory_service_1.inventoryService.stockIn({ productId: item.productId, warehouseId: po.warehouseId, quantity: item.quantity, purchaseOrderId: po.id, unitCost: item.unitPrice }, userId);
                item.receivedQuantity = item.quantity;
            }
            // Update supplier stats
            const supplierRepo = database_1.AppDataSource.getRepository(Supplier_1.Supplier);
            const supplier = await supplierRepo.findOne({ where: { id: po.supplierId } });
            if (supplier) {
                supplier.totalOrders += 1;
                const onTime = po.actualDeliveryDate <= po.expectedDeliveryDate;
                if (onTime)
                    supplier.onTimeDeliveries += 1;
                await supplierRepo.save(supplier);
            }
        }
        await repo().save(po);
        await (0, auditLogger_1.logAudit)({ userId, action: `PO_STATUS_${status}`, entityType: "PURCHASE_ORDER", entityId: id, oldValues: old, newValues: { status } });
        return po;
    },
    async delete(id, userId) {
        const po = await repo().findOne({ where: { id } });
        if (!po)
            throw (0, errorHandler_1.createError)("Purchase order not found", 404);
        if (po.status !== "DRAFT")
            throw (0, errorHandler_1.createError)("Only DRAFT purchase orders can be deleted", 422);
        await repo().remove(po);
        await (0, auditLogger_1.logAudit)({ userId, action: "DELETE_PO", entityType: "PURCHASE_ORDER", entityId: id });
    },
};
//# sourceMappingURL=purchaseOrder.service.js.map
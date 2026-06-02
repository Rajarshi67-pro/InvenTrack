"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryService = void 0;
const database_1 = require("../config/database");
const Product_1 = require("../entities/Product");
const Warehouse_1 = require("../entities/Warehouse");
const StockMovement_1 = require("../entities/StockMovement");
const notification_service_1 = require("./notification.service");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_1 = require("../middleware/auditLogger");
exports.inventoryService = {
    async stockIn(dto, userId) {
        return database_1.AppDataSource.transaction(async (manager) => {
            const product = await manager.findOne(Product_1.Product, { where: { id: dto.productId } });
            if (!product)
                throw (0, errorHandler_1.createError)("Product not found", 404);
            const warehouse = await manager.findOne(Warehouse_1.Warehouse, { where: { id: dto.warehouseId } });
            if (!warehouse)
                throw (0, errorHandler_1.createError)("Warehouse not found", 404);
            product.quantity += dto.quantity;
            warehouse.currentStockCount += dto.quantity;
            await manager.save(product);
            await manager.save(warehouse);
            const movement = manager.create(StockMovement_1.StockMovement, { productId: dto.productId, warehouseId: dto.warehouseId, movementType: "IN", quantity: dto.quantity, purchaseOrderId: dto.purchaseOrderId, batchNumber: dto.batchNumber, expiryDate: dto.expiryDate, unitCost: dto.unitCost, performedBy: userId, remarks: dto.remarks });
            const saved = await manager.save(movement);
            if (product.quantity > product.maxStockLevel) {
                await notification_service_1.notificationService.broadcastToAdmins("OVERSTOCK", "Overstock Alert", `${product.name} is overstocked (${product.quantity}/${product.maxStockLevel} units)`, "MEDIUM");
            }
            await (0, auditLogger_1.logAudit)({ userId, action: "STOCK_IN", entityType: "INVENTORY", entityId: dto.productId, newValues: dto });
            return saved;
        });
    },
    async stockOut(dto, userId) {
        return database_1.AppDataSource.transaction(async (manager) => {
            const product = await manager.findOne(Product_1.Product, { where: { id: dto.productId } });
            if (!product)
                throw (0, errorHandler_1.createError)("Product not found", 404);
            if (product.quantity < dto.quantity)
                throw (0, errorHandler_1.createError)(`Insufficient stock. Available: ${product.quantity}, Requested: ${dto.quantity}`, 422);
            const warehouse = await manager.findOne(Warehouse_1.Warehouse, { where: { id: dto.warehouseId } });
            if (!warehouse)
                throw (0, errorHandler_1.createError)("Warehouse not found", 404);
            product.quantity -= dto.quantity;
            warehouse.currentStockCount -= dto.quantity;
            await manager.save(product);
            await manager.save(warehouse);
            const movement = manager.create(StockMovement_1.StockMovement, { productId: dto.productId, warehouseId: dto.warehouseId, movementType: "OUT", quantity: dto.quantity, performedBy: userId, remarks: dto.remarks });
            const saved = await manager.save(movement);
            if (product.quantity === 0) {
                await notification_service_1.notificationService.broadcastToAdmins("OUT_OF_STOCK", "Out of Stock Alert", `${product.name} is now out of stock!`, "CRITICAL");
            }
            else if (product.quantity <= product.minStockLevel) {
                await notification_service_1.notificationService.broadcastToAdmins("LOW_STOCK", "Low Stock Alert", `${product.name} is low on stock (${product.quantity} units remaining, minimum: ${product.minStockLevel})`, "HIGH");
            }
            await (0, auditLogger_1.logAudit)({ userId, action: "STOCK_OUT", entityType: "INVENTORY", entityId: dto.productId, newValues: dto });
            return saved;
        });
    },
    async transfer(dto, userId) {
        await exports.inventoryService.stockOut({ productId: dto.productId, warehouseId: dto.fromWarehouseId, quantity: dto.quantity, remarks: dto.remarks }, userId);
        await exports.inventoryService.stockIn({ productId: dto.productId, warehouseId: dto.toWarehouseId, quantity: dto.quantity, remarks: dto.remarks }, userId);
        await (0, auditLogger_1.logAudit)({ userId, action: "STOCK_TRANSFER", entityType: "INVENTORY", entityId: dto.productId, newValues: dto });
    },
    async adjustment(dto, userId) {
        return database_1.AppDataSource.transaction(async (manager) => {
            const product = await manager.findOne(Product_1.Product, { where: { id: dto.productId } });
            if (!product)
                throw (0, errorHandler_1.createError)("Product not found", 404);
            const delta = dto.newQuantity - product.quantity;
            const old = { ...product };
            product.quantity = dto.newQuantity;
            await manager.save(product);
            const movement = manager.create(StockMovement_1.StockMovement, { productId: dto.productId, warehouseId: dto.warehouseId, movementType: "ADJUSTMENT", quantity: Math.abs(delta), performedBy: userId, remarks: `Adjustment: ${dto.reason}. Delta: ${delta > 0 ? "+" : ""}${delta}` });
            const saved = await manager.save(movement);
            await (0, auditLogger_1.logAudit)({ userId, action: "STOCK_ADJUSTMENT", entityType: "INVENTORY", entityId: dto.productId, oldValues: old, newValues: dto });
            return saved;
        });
    },
    async getMovements(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const qb = database_1.AppDataSource.getRepository(StockMovement_1.StockMovement).createQueryBuilder("sm").leftJoinAndSelect("sm.product", "product").leftJoinAndSelect("sm.warehouse", "warehouse").leftJoinAndSelect("sm.performer", "performer").orderBy("sm.created_at", "DESC").skip((page - 1) * limit).take(limit);
        if (query.type)
            qb.andWhere("sm.movement_type = :type", { type: query.type });
        if (query.warehouseId)
            qb.andWhere("sm.warehouse_id = :wid", { wid: query.warehouseId });
        if (query.productId)
            qb.andWhere("sm.product_id = :pid", { pid: query.productId });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
    },
};
//# sourceMappingURL=inventory.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const database_1 = require("../config/database");
const Product_1 = require("../entities/Product");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_1 = require("../middleware/auditLogger");
const repo = () => database_1.AppDataSource.getRepository(Product_1.Product);
exports.productService = {
    async getAll(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 15, 100);
        const qb = repo().createQueryBuilder("p").leftJoinAndSelect("p.warehouse", "warehouse").leftJoinAndSelect("p.supplier", "supplier").where("p.is_active = 1").orderBy(`p.${query.sortBy || "name"}`, query.sortOrder || "ASC").skip((page - 1) * limit).take(limit);
        if (query.search)
            qb.andWhere("(LOWER(p.name) LIKE :s OR LOWER(p.sku) LIKE :s OR p.barcode LIKE :s)", { s: `%${query.search?.toLowerCase()}%` });
        if (query.category)
            qb.andWhere("p.category = :cat", { cat: query.category });
        if (query.warehouseId)
            qb.andWhere("p.warehouse_id = :wid", { wid: query.warehouseId });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
    },
    async getById(id) {
        const p = await repo().findOne({ where: { id }, relations: ["warehouse", "supplier"] });
        if (!p)
            throw (0, errorHandler_1.createError)("Product not found", 404);
        return p;
    },
    async create(dto, userId) {
        const existing = await repo().findOne({ where: { sku: dto.sku } });
        if (existing)
            throw (0, errorHandler_1.createError)("SKU already exists", 409);
        const p = repo().create({ ...dto, barcode: dto.sku }); // Use SKU as default barcode
        const saved = await repo().save(p);
        await (0, auditLogger_1.logAudit)({ userId, action: "CREATE_PRODUCT", entityType: "PRODUCT", entityId: saved.id, newValues: dto });
        return saved;
    },
    async update(id, dto, userId) {
        const p = await repo().findOne({ where: { id } });
        if (!p)
            throw (0, errorHandler_1.createError)("Product not found", 404);
        const old = { ...p };
        Object.assign(p, dto);
        const saved = await repo().save(p);
        await (0, auditLogger_1.logAudit)({ userId, action: "UPDATE_PRODUCT", entityType: "PRODUCT", entityId: id, oldValues: old, newValues: dto });
        return saved;
    },
    async delete(id, userId) {
        const p = await repo().findOne({ where: { id } });
        if (!p)
            throw (0, errorHandler_1.createError)("Product not found", 404);
        p.isActive = 0;
        await repo().save(p);
        await (0, auditLogger_1.logAudit)({ userId, action: "DELETE_PRODUCT", entityType: "PRODUCT", entityId: id });
    },
    async getByBarcode(barcode) {
        const p = await repo().findOne({ where: { barcode }, relations: ["warehouse", "supplier"] });
        if (!p) {
            const bySku = await repo().findOne({ where: { sku: barcode } });
            if (!bySku)
                throw (0, errorHandler_1.createError)("Product not found for barcode: " + barcode, 404);
            return bySku;
        }
        return p;
    },
    async getLowStock() {
        return repo().createQueryBuilder("p").where("p.is_active = 1").andWhere("p.quantity <= p.min_stock_level").orderBy("p.quantity", "ASC").getMany();
    },
    async getOutOfStock() {
        return repo().find({ where: { quantity: 0, isActive: 1 } });
    },
};
//# sourceMappingURL=product.service.js.map
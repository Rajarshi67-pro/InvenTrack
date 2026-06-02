"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warehouseService = void 0;
const database_1 = require("../config/database");
const Warehouse_1 = require("../entities/Warehouse");
const Product_1 = require("../entities/Product");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_1 = require("../middleware/auditLogger");
const repo = () => database_1.AppDataSource.getRepository(Warehouse_1.Warehouse);
exports.warehouseService = {
    async getAll(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 12, 100);
        const qb = repo().createQueryBuilder("w").where("w.is_active = 1").orderBy(`w.${query.sortBy || "name"}`, query.sortOrder || "ASC").skip((page - 1) * limit).take(limit);
        if (query.search)
            qb.andWhere("(LOWER(w.name) LIKE :s OR LOWER(w.city) LIKE :s)", { s: `%${query.search.toLowerCase()}%` });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
    },
    async getById(id) {
        const w = await repo().findOne({ where: { id }, relations: ["products"] });
        if (!w)
            throw (0, errorHandler_1.createError)("Warehouse not found", 404);
        return w;
    },
    async create(dto, userId) {
        const w = repo().create(dto);
        const saved = await repo().save(w);
        await (0, auditLogger_1.logAudit)({ userId, action: "CREATE_WAREHOUSE", entityType: "WAREHOUSE", entityId: saved.id, newValues: dto });
        return saved;
    },
    async update(id, dto, userId) {
        const w = await repo().findOne({ where: { id } });
        if (!w)
            throw (0, errorHandler_1.createError)("Warehouse not found", 404);
        const old = { ...w };
        Object.assign(w, dto);
        const saved = await repo().save(w);
        await (0, auditLogger_1.logAudit)({ userId, action: "UPDATE_WAREHOUSE", entityType: "WAREHOUSE", entityId: id, oldValues: old, newValues: dto });
        return saved;
    },
    async delete(id, userId) {
        const w = await repo().findOne({ where: { id } });
        if (!w)
            throw (0, errorHandler_1.createError)("Warehouse not found", 404);
        const productCount = await database_1.AppDataSource.getRepository(Product_1.Product).count({ where: { warehouseId: id, isActive: 1 } });
        if (productCount > 0)
            throw (0, errorHandler_1.createError)(`Cannot delete warehouse with ${productCount} active products`, 409);
        w.isActive = 0;
        await repo().save(w);
        await (0, auditLogger_1.logAudit)({ userId, action: "DELETE_WAREHOUSE", entityType: "WAREHOUSE", entityId: id });
    },
};
//# sourceMappingURL=warehouse.service.js.map
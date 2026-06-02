import { AppDataSource } from "../config/database";
import { Warehouse } from "../entities/Warehouse";
import { Product } from "../entities/Product";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../middleware/auditLogger";
import type { CreateWarehouseDto, UpdateWarehouseDto, PaginationQuery, PaginatedResponse } from "../types";

const repo = () => AppDataSource.getRepository(Warehouse);

export const warehouseService = {
  async getAll(query: PaginationQuery): Promise<PaginatedResponse<Warehouse>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 100);
    const qb = repo().createQueryBuilder("w").where("w.is_active = 1").orderBy(`w.${query.sortBy || "name"}`, query.sortOrder || "ASC").skip((page - 1) * limit).take(limit);
    if (query.search) qb.andWhere("(LOWER(w.name) LIKE :s OR LOWER(w.city) LIKE :s)", { s: `%${query.search.toLowerCase()}%` });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
  },

  async getById(id: string): Promise<Warehouse> {
    const w = await repo().findOne({ where: { id }, relations: ["products"] });
    if (!w) throw createError("Warehouse not found", 404);
    return w;
  },

  async create(dto: CreateWarehouseDto, userId?: string): Promise<Warehouse> {
    const w = repo().create(dto);
    const saved = await repo().save(w);
    await logAudit({ userId, action: "CREATE_WAREHOUSE", entityType: "WAREHOUSE", entityId: saved.id, newValues: dto });
    return saved;
  },

  async update(id: string, dto: UpdateWarehouseDto, userId?: string): Promise<Warehouse> {
    const w = await repo().findOne({ where: { id } });
    if (!w) throw createError("Warehouse not found", 404);
    const old = { ...w };
    Object.assign(w, dto);
    const saved = await repo().save(w);
    await logAudit({ userId, action: "UPDATE_WAREHOUSE", entityType: "WAREHOUSE", entityId: id, oldValues: old, newValues: dto });
    return saved;
  },

  async delete(id: string, userId?: string): Promise<void> {
    const w = await repo().findOne({ where: { id } });
    if (!w) throw createError("Warehouse not found", 404);
    const productCount = await AppDataSource.getRepository(Product).count({ where: { warehouseId: id, isActive: 1 } });
    if (productCount > 0) throw createError(`Cannot delete warehouse with ${productCount} active products`, 409);
    w.isActive = 0;
    await repo().save(w);
    await logAudit({ userId, action: "DELETE_WAREHOUSE", entityType: "WAREHOUSE", entityId: id });
  },
};
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../middleware/auditLogger";
import type { CreateProductDto, UpdateProductDto, PaginationQuery, PaginatedResponse } from "../types";

const repo = () => AppDataSource.getRepository(Product);

export const productService = {
  async getAll(query: PaginationQuery & { category?: string; stockStatus?: string; warehouseId?: string }): Promise<PaginatedResponse<Product>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 15, 100);
    const qb = repo().createQueryBuilder("p").leftJoinAndSelect("p.warehouse", "warehouse").leftJoinAndSelect("p.supplier", "supplier").where("p.is_active = 1").orderBy(`p.${query.sortBy || "name"}`, query.sortOrder || "ASC").skip((page - 1) * limit).take(limit);
    if (query.search) qb.andWhere("(LOWER(p.name) LIKE :s OR LOWER(p.sku) LIKE :s OR p.barcode LIKE :s)", { s: `%${query.search?.toLowerCase()}%` });
    if (query.category) qb.andWhere("p.category = :cat", { cat: query.category });
    if (query.warehouseId) qb.andWhere("p.warehouse_id = :wid", { wid: query.warehouseId });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
  },

  async getById(id: string): Promise<Product> {
    const p = await repo().findOne({ where: { id }, relations: ["warehouse", "supplier"] });
    if (!p) throw createError("Product not found", 404);
    return p;
  },

  async create(dto: CreateProductDto, userId?: string): Promise<Product> {
    const existing = await repo().findOne({ where: { sku: dto.sku } });
    if (existing) throw createError("SKU already exists", 409);
    const p = repo().create({ ...dto, barcode: dto.sku }); // Use SKU as default barcode
    const saved = await repo().save(p);
    await logAudit({ userId, action: "CREATE_PRODUCT", entityType: "PRODUCT", entityId: saved.id, newValues: dto });
    return saved;
  },

  async update(id: string, dto: UpdateProductDto, userId?: string): Promise<Product> {
    const p = await repo().findOne({ where: { id } });
    if (!p) throw createError("Product not found", 404);
    const old = { ...p };
    Object.assign(p, dto);
    const saved = await repo().save(p);
    await logAudit({ userId, action: "UPDATE_PRODUCT", entityType: "PRODUCT", entityId: id, oldValues: old, newValues: dto });
    return saved;
  },

  async delete(id: string, userId?: string): Promise<void> {
    const p = await repo().findOne({ where: { id } });
    if (!p) throw createError("Product not found", 404);
    p.isActive = 0;
    await repo().save(p);
    await logAudit({ userId, action: "DELETE_PRODUCT", entityType: "PRODUCT", entityId: id });
  },

  async getByBarcode(barcode: string): Promise<Product> {
    const p = await repo().findOne({ where: { barcode }, relations: ["warehouse", "supplier"] });
    if (!p) { const bySku = await repo().findOne({ where: { sku: barcode } }); if (!bySku) throw createError("Product not found for barcode: " + barcode, 404); return bySku; }
    return p;
  },

  async getLowStock(): Promise<Product[]> {
    return repo().createQueryBuilder("p").where("p.is_active = 1").andWhere("p.quantity <= p.min_stock_level").orderBy("p.quantity", "ASC").getMany();
  },

  async getOutOfStock(): Promise<Product[]> {
    return repo().find({ where: { quantity: 0, isActive: 1 } });
  },
};
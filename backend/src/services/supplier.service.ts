import { AppDataSource } from "../config/database";
import { Supplier } from "../entities/Supplier";
import { PurchaseOrder } from "../entities/PurchaseOrder";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../middleware/auditLogger";
import type { CreateSupplierDto, UpdateSupplierDto, PaginationQuery, PaginatedResponse } from "../types";

const repo = () => AppDataSource.getRepository(Supplier);

export const supplierService = {
  async getAll(query: PaginationQuery): Promise<PaginatedResponse<Supplier>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 12, 100);
    const qb = repo().createQueryBuilder("s").where("s.is_active = 1").orderBy("s.name", "ASC").skip((page - 1) * limit).take(limit);
    if (query.search) qb.andWhere("(LOWER(s.name) LIKE :s OR LOWER(s.city) LIKE :s)", { s: `%${query.search?.toLowerCase()}%` });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
  },

  async getById(id: string): Promise<Supplier> {
    const s = await repo().findOne({ where: { id } });
    if (!s) throw createError("Supplier not found", 404);
    return s;
  },

  async create(dto: CreateSupplierDto, userId?: string): Promise<Supplier> {
    const s = repo().create(dto);
    const saved = await repo().save(s);
    await logAudit({ userId, action: "CREATE_SUPPLIER", entityType: "SUPPLIER", entityId: saved.id, newValues: dto });
    return saved;
  },

  async update(id: string, dto: UpdateSupplierDto, userId?: string): Promise<Supplier> {
    const s = await repo().findOne({ where: { id } });
    if (!s) throw createError("Supplier not found", 404);
    Object.assign(s, dto);
    const saved = await repo().save(s);
    await logAudit({ userId, action: "UPDATE_SUPPLIER", entityType: "SUPPLIER", entityId: id, newValues: dto });
    return saved;
  },

  async delete(id: string, userId?: string): Promise<void> {
    const s = await repo().findOne({ where: { id } });
    if (!s) throw createError("Supplier not found", 404);
    const activePOs = await AppDataSource.getRepository(PurchaseOrder).count({ where: { supplierId: id } });
    if (activePOs > 0) throw createError(`Cannot delete supplier with ${activePOs} purchase orders`, 409);
    s.isActive = 0;
    await repo().save(s);
    await logAudit({ userId, action: "DELETE_SUPPLIER", entityType: "SUPPLIER", entityId: id });
  },

  async getPerformanceAnalytics(supplierId: string) {
    const s = await repo().findOne({ where: { id: supplierId } });
    if (!s) throw createError("Supplier not found", 404);
    const pos = await AppDataSource.getRepository(PurchaseOrder).find({ where: { supplierId }, take: 50, order: { createdAt: "DESC" } });
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
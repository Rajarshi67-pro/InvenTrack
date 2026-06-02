import { AppDataSource } from "../config/database";
import { Notification } from "../entities/Notification";
import { User } from "../entities/User";
import { createError } from "../middleware/errorHandler";
import type { PaginationQuery, PaginatedResponse } from "../types";

const repo = () => AppDataSource.getRepository(Notification);

export const notificationService = {
  async create(userId: string, type: string, title: string, message: string, options?: { entityType?: string; entityId?: string; severity?: string }): Promise<Notification> {
    const n = repo().create({ userId, type, title, message, severity: options?.severity || "LOW", entityType: options?.entityType, entityId: options?.entityId });
    return repo().save(n);
  },

  async getByUser(userId: string, query: PaginationQuery & { isRead?: number }): Promise<PaginatedResponse<Notification>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const qb = repo().createQueryBuilder("n").where("n.user_id = :userId", { userId }).orderBy("n.created_at", "DESC").skip((page - 1) * limit).take(limit);
    if (query.isRead !== undefined) qb.andWhere("n.is_read = :isRead", { isRead: query.isRead });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
  },

  async markRead(id: string, userId: string): Promise<void> {
    const n = await repo().findOne({ where: { id, userId } });
    if (!n) throw createError("Notification not found", 404);
    n.isRead = 1;
    await repo().save(n);
  },

  async markAllRead(userId: string): Promise<void> {
    await repo().update({ userId, isRead: 0 }, { isRead: 1 });
  },

  async delete(id: string, userId: string): Promise<void> {
    const n = await repo().findOne({ where: { id, userId } });
    if (!n) throw createError("Notification not found", 404);
    await repo().remove(n);
  },

  async broadcastToAdmins(type: string, title: string, message: string, severity = "MEDIUM"): Promise<void> {
    const admins = await AppDataSource.getRepository(User).find({ where: { role: "ADMIN", isActive: 1 } });
    const toSave = admins.map((admin) => repo().create({ userId: admin.id, type, title, message, severity }));
    if (toSave.length > 0) await repo().save(toSave);
  },
};
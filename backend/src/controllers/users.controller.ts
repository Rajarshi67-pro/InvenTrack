import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { createError } from "../middleware/errorHandler";
import type { ApiResponse, PaginatedResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);
const repo = () => AppDataSource.getRepository(User);

export const usersController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search } = req.query as Record<string, string>;
      const lim = Math.min(Number(limit), 100);
      const qb = repo().createQueryBuilder("u").leftJoinAndSelect("u.warehouse", "warehouse").orderBy("u.created_at", "DESC").skip((Number(page) - 1) * lim).take(lim);
      if (search) qb.where("(LOWER(u.full_name) LIKE :s OR LOWER(u.email) LIKE :s)", { s: `%${search.toLowerCase()}%` });
      const [data, total] = await qb.getManyAndCount();
      const p = Number(page);
      ok(res, { data: data.map((u) => u.toSafeObject()), total, page: p, limit: lim, totalPages: Math.ceil(total / lim), hasNext: p < Math.ceil(total / lim), hasPrev: p > 1 } as PaginatedResponse<ReturnType<User["toSafeObject"]>>);
    } catch (e) { next(e); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try { const u = await repo().findOne({ where: { id: req.params.id }, relations: ["warehouse"] }); if (!u) throw createError("User not found", 404); ok(res, u.toSafeObject()); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { const u = await repo().findOne({ where: { id: req.params.id } }); if (!u) throw createError("User not found", 404); const { fullName, phone, role, warehouseId } = req.body; if (fullName) u.fullName = fullName; if (phone) u.phone = phone; if (role) u.role = role; if (warehouseId !== undefined) u.warehouseId = warehouseId; await repo().save(u); ok(res, u.toSafeObject()); } catch (e) { next(e); }
  },
  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try { const u = await repo().findOne({ where: { id: req.params.id } }); if (!u) throw createError("User not found", 404); if (u.id === req.user?.userId) throw createError("Cannot deactivate yourself", 400); u.isActive = u.isActive === 1 ? 0 : 1; await repo().save(u); ok(res, u.toSafeObject(), `User ${u.isActive ? "activated" : "deactivated"}`); } catch (e) { next(e); }
  },
};
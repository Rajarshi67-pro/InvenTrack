import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { notificationService } from "../services/notification.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const dbDown = () => !AppDataSource.isInitialized;

export const notificationsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { data: [], total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false });
      ok(res, await notificationService.getByUser(req.user!.userId, req.query as any));
    } catch (e) { next(e); }
  },
  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, null, "Marked as read");
      await notificationService.markRead(req.params.id, req.user!.userId); ok(res, null, "Marked as read");
    } catch (e) { next(e); }
  },
  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, null, "All marked as read");
      await notificationService.markAllRead(req.user!.userId); ok(res, null, "All marked as read");
    } catch (e) { next(e); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, null, "Deleted");
      await notificationService.delete(req.params.id, req.user!.userId); ok(res, null, "Deleted");
    } catch (e) { next(e); }
  },
};
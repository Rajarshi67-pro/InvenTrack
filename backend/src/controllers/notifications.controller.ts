import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const notificationsController = {
  async getAll(req: Request, res: Response, next: NextFunction) { try { ok(res, await notificationService.getByUser(req.user!.userId, req.query as any)); } catch (e) { next(e); } },
  async markRead(req: Request, res: Response, next: NextFunction) { try { await notificationService.markRead(req.params.id, req.user!.userId); ok(res, null, "Marked as read"); } catch (e) { next(e); } },
  async markAllRead(req: Request, res: Response, next: NextFunction) { try { await notificationService.markAllRead(req.user!.userId); ok(res, null, "All marked as read"); } catch (e) { next(e); } },
  async delete(req: Request, res: Response, next: NextFunction) { try { await notificationService.delete(req.params.id, req.user!.userId); ok(res, null, "Deleted"); } catch (e) { next(e); } },
};
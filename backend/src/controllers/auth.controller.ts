import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { emailService } from "../services/email.service";
import { createError } from "../middleware/errorHandler";
import type { ApiResponse } from "../types";

const ok = <T>(res: Response, data: T, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try { const result = await authService.login(req.body, req.ip); ok(res, result, "Login successful"); } catch (e) { next(e); }
  },
  async register(req: Request, res: Response, next: NextFunction) {
    try { const user = await authService.register(req.body); ok(res, user.toSafeObject(), "User registered", 201); } catch (e) { next(e); }
  },
  async refresh(req: Request, res: Response, next: NextFunction) {
    try { const { refreshToken } = req.body; if (!refreshToken) throw createError("Refresh token required", 400); const tokens = await authService.refreshTokens(refreshToken); ok(res, { tokens }, "Tokens refreshed"); } catch (e) { next(e); }
  },
  async logout(req: Request, res: Response, next: NextFunction) {
    try { const { refreshToken } = req.body; if (req.user && refreshToken) await authService.logout(req.user.userId, refreshToken); ok(res, null, "Logged out successfully"); } catch (e) { next(e); }
  },
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try { const token = await authService.forgotPassword(req.body.email); if (token) await emailService.sendPasswordReset(req.body.email, token); ok(res, null, "If the email exists, a reset link has been sent"); } catch (e) { next(e); }
  },
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try { await authService.resetPassword(req.body.token, req.body.password); ok(res, null, "Password reset successfully"); } catch (e) { next(e); }
  },
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try { await authService.changePassword(req.user!.userId, req.body.oldPassword, req.body.newPassword); ok(res, null, "Password changed"); } catch (e) { next(e); }
  },
  async getMe(req: Request, res: Response, next: NextFunction) {
    try { const user = await AppDataSource.getRepository(User).findOne({ where: { id: req.user!.userId } }); if (!user) throw createError("User not found", 404); ok(res, user.toSafeObject()); } catch (e) { next(e); }
  },
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try { const repo = AppDataSource.getRepository(User); const user = await repo.findOne({ where: { id: req.user!.userId } }); if (!user) throw createError("Not found", 404); const { fullName, phone } = req.body; if (fullName) user.fullName = fullName; if (phone) user.phone = phone; await repo.save(user); ok(res, user.toSafeObject()); } catch (e) { next(e); }
  },
};
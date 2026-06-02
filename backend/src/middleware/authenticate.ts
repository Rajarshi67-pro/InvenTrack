import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { ApiResponse } from '../types';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // ── DEMO OVERRIDE ──────────────────────────────────────────────────
    if (payload.userId === "demo-admin-id" || payload.userId === "demo-manager-id") {
      req.user = {
        userId: payload.userId,
        email: payload.userId === "demo-admin-id" ? "admin@inventrack.com" : "manager@inventrack.com",
        role: payload.userId === "demo-admin-id" ? "ADMIN" : "MANAGER",
        warehouseId: undefined,
      };
      return next();
    }
    // ───────────────────────────────────────────────────────────────────

    // Verify user still exists and is active
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: payload.userId } });

    if (!user || user.isActive === 0) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive or does not exist',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    // Check account lock
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      res.status(403).json({
        success: false,
        message: `Account locked until ${user.lockedUntil.toISOString()}`,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MANAGER',
      warehouseId: user.warehouseId,
    };

    next();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    res.status(401).json({
      success: false,
      message: `Authentication failed: ${message}`,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
};

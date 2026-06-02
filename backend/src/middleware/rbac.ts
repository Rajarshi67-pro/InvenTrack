import { Request, Response, NextFunction } from 'express';
import { ApiResponse, UserRole } from '../types';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireManagerOrAdmin = requireRole('ADMIN', 'MANAGER');

// Warehouse-scoped access: managers can only access their assigned warehouse
export const requireWarehouseAccess = (warehouseIdParam = 'warehouseId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required', timestamp: new Date().toISOString() } as ApiResponse);
      return;
    }

    // Admins bypass warehouse restrictions
    if (req.user.role === 'ADMIN') { next(); return; }

    const requestedWarehouseId = req.params[warehouseIdParam] || req.body[warehouseIdParam] || req.query[warehouseIdParam];
    if (requestedWarehouseId && req.user.warehouseId && requestedWarehouseId !== req.user.warehouseId) {
      res.status(403).json({
        success: false,
        message: 'You do not have access to this warehouse',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
      return;
    }

    next();
  };
};

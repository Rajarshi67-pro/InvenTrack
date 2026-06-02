import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
export declare const requireRole: (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireManagerOrAdmin: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireWarehouseAccess: (warehouseIdParam?: string) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.d.ts.map
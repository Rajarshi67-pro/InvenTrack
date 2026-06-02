import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../entities/AuditLog';

export const auditLog = (action: string, entityType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    let responseBody: unknown;
    let statusCode = 200;

    res.json = (body: unknown): Response => {
      responseBody = body;
      statusCode = res.statusCode;
      return originalJson(body);
    };

    next();

    // After response is sent, log the action
    res.on('finish', async () => {
      try {
        if (!AppDataSource.isInitialized) return;
        const repo = AppDataSource.getRepository(AuditLog);
        const log = repo.create({
          userId: req.user?.userId,
          action,
          entityType,
          entityId: req.params.id,
          newValues: JSON.stringify(req.body),
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          status: statusCode < 400 ? 'SUCCESS' : 'FAILURE',
          errorMessage: statusCode >= 400 ? JSON.stringify(responseBody) : undefined,
        });
        await repo.save(log);
      } catch { /* Silent fail — don't break response */ }
    });
  };
};

// Standalone audit logger (call explicitly in services)
export const logAudit = async (data: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: object;
  newValues?: object;
  ipAddress?: string;
  status?: string;
  errorMessage?: string;
}): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) return;
    const repo = AppDataSource.getRepository(AuditLog);
    const log = repo.create({
      ...data,
      oldValues: data.oldValues ? JSON.stringify(data.oldValues) : undefined,
      newValues: data.newValues ? JSON.stringify(data.newValues) : undefined,
      status: data.status || 'SUCCESS',
    });
    await repo.save(log);
  } catch { /* Silent fail */ }
};

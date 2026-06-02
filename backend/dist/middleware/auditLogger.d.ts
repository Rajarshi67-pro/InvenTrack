import { Request, Response, NextFunction } from 'express';
export declare const auditLog: (action: string, entityType: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const logAudit: (data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: object;
    newValues?: object;
    ipAddress?: string;
    status?: string;
    errorMessage?: string;
}) => Promise<void>;
//# sourceMappingURL=auditLogger.d.ts.map
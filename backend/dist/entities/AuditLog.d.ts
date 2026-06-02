import { User } from './User';
export declare class AuditLog {
    id: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: string;
    newValues?: string;
    ipAddress?: string;
    userAgent?: string;
    status: string;
    errorMessage?: string;
    createdAt: Date;
    user?: User;
    generateId(): void;
}
//# sourceMappingURL=AuditLog.d.ts.map
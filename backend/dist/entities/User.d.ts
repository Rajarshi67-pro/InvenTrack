import { Warehouse } from './Warehouse';
import { AuditLog } from './AuditLog';
import { RefreshToken } from './RefreshToken';
import { Notification } from './Notification';
export declare class User {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: string;
    phone?: string;
    isActive: number;
    warehouseId?: string;
    lastLogin?: Date;
    resetToken?: string;
    resetTokenExpiry?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
    warehouse?: Warehouse;
    refreshTokens: RefreshToken[];
    auditLogs: AuditLog[];
    notifications: Notification[];
    generateId(): void;
    toSafeObject(): Omit<this, "generateId" | "passwordHash" | "resetToken" | "resetTokenExpiry" | "toSafeObject">;
}
//# sourceMappingURL=User.d.ts.map
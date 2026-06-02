import { Notification } from "../entities/Notification";
import type { PaginationQuery, PaginatedResponse } from "../types";
export declare const notificationService: {
    create(userId: string, type: string, title: string, message: string, options?: {
        entityType?: string;
        entityId?: string;
        severity?: string;
    }): Promise<Notification>;
    getByUser(userId: string, query: PaginationQuery & {
        isRead?: number;
    }): Promise<PaginatedResponse<Notification>>;
    markRead(id: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    delete(id: string, userId: string): Promise<void>;
    broadcastToAdmins(type: string, title: string, message: string, severity?: string): Promise<void>;
};
//# sourceMappingURL=notification.service.d.ts.map
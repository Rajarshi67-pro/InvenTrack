import { User } from './User';
export declare class Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    entityType?: string;
    entityId?: string;
    isRead: number;
    severity: string;
    createdAt: Date;
    user: User;
    generateId(): void;
}
//# sourceMappingURL=Notification.d.ts.map
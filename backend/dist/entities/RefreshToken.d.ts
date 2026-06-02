import { User } from './User';
export declare class RefreshToken {
    id: string;
    userId: string;
    token: string;
    tokenFamily: string;
    expiresAt: Date;
    isRevoked: number;
    createdAt: Date;
    user: User;
    generateId(): void;
    get isExpired(): boolean;
}
//# sourceMappingURL=RefreshToken.d.ts.map
import { User } from "../entities/User";
import type { LoginRequest, RegisterRequest, AuthResponse, AuthTokens } from "../types";
export declare const authService: {
    login(data: LoginRequest, ip?: string): Promise<AuthResponse>;
    register(data: RegisterRequest): Promise<User>;
    refreshTokens(oldRefreshToken: string): Promise<AuthTokens>;
    logout(userId: string, refreshToken: string): Promise<void>;
    forgotPassword(email: string): Promise<string>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    _issueTokens(user: User, family?: string): Promise<AuthTokens>;
};
//# sourceMappingURL=auth.service.d.ts.map
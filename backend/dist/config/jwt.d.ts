export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    warehouseId?: string;
}
export interface RefreshTokenPayload {
    userId: string;
    tokenFamily: string;
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: RefreshTokenPayload) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const decodeToken: (token: string) => TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map
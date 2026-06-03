"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const RefreshToken_1 = require("../entities/RefreshToken");
const jwt_1 = require("../config/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
const auditLogger_1 = require("../middleware/auditLogger");
const userRepo = () => database_1.AppDataSource.getRepository(User_1.User);
const rtRepo = () => database_1.AppDataSource.getRepository(RefreshToken_1.RefreshToken);
exports.authService = {
    async login(data, ip) {
        // ── DEMO OVERRIDE ──────────────────────────────────────────────────
        if ((data.email.toLowerCase() === "admin@inventrack.com" && data.password === "Admin@123") ||
            (data.email.toLowerCase() === "manager@inventrack.com" && data.password === "Manager@123")) {
            const isManager = data.email.toLowerCase() === "manager@inventrack.com";
            const user = {
                id: isManager ? "demo-manager-id" : "demo-admin-id",
                fullName: isManager ? "Demo Manager" : "Demo Admin",
                email: data.email.toLowerCase(),
                role: isManager ? "MANAGER" : "ADMIN",
                warehouseId: undefined,
                lastLogin: new Date()
            };
            const tokenFamily = (0, uuid_1.v4)();
            const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role, warehouseId: user.warehouseId });
            const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, tokenFamily });
            return { user: user, tokens: { accessToken, refreshToken, expiresIn: 15 * 60 } };
        }
        // ───────────────────────────────────────────────────────────────────
        const user = await userRepo().findOne({ where: { email: data.email.toLowerCase() } });
        if (!user)
            throw (0, errorHandler_1.createError)("Invalid email or password", 401);
        const valid = await bcryptjs_1.default.compare(data.password, user.passwordHash);
        if (!valid) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
            }
            await userRepo().save(user);
            throw (0, errorHandler_1.createError)("Invalid email or password", 401);
        }
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLogin = new Date();
        await userRepo().save(user);
        const tokens = await exports.authService._issueTokens(user);
        await (0, auditLogger_1.logAudit)({ userId: user.id, action: "LOGIN", entityType: "AUTH", ipAddress: ip, status: "SUCCESS" });
        return {
            user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, warehouseId: user.warehouseId, lastLogin: user.lastLogin },
            tokens,
        };
    },
    async register(data) {
        const existing = await userRepo().findOne({ where: { email: data.email.toLowerCase() } });
        if (existing)
            throw (0, errorHandler_1.createError)("Email already registered", 409);
        const hash = await bcryptjs_1.default.hash(data.password, 12);
        const user = userRepo().create({
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            passwordHash: hash,
            role: data.role,
            warehouseId: data.warehouseId,
        });
        const saved = await userRepo().save(user);
        await (0, auditLogger_1.logAudit)({ userId: saved.id, action: "REGISTER", entityType: "USER", entityId: saved.id, status: "SUCCESS" });
        return saved;
    },
    async refreshTokens(oldRefreshToken) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(oldRefreshToken);
        }
        catch {
            throw (0, errorHandler_1.createError)("Invalid refresh token", 401);
        }
        const rt = await rtRepo().findOne({ where: { token: oldRefreshToken }, relations: ["user"] });
        if (!rt || rt.isRevoked === 1 || rt.isExpired) {
            // Token reuse detected - revoke entire family
            await rtRepo().update({ tokenFamily: payload.tokenFamily }, { isRevoked: 1 });
            throw (0, errorHandler_1.createError)("Refresh token reuse detected. Please log in again.", 401);
        }
        // Rotate: revoke old, issue new
        rt.isRevoked = 1;
        await rtRepo().save(rt);
        return exports.authService._issueTokens(rt.user, payload.tokenFamily);
    },
    async logout(userId, refreshToken) {
        await rtRepo().update({ userId, token: refreshToken }, { isRevoked: 1 });
    },
    async forgotPassword(email) {
        const user = await userRepo().findOne({ where: { email: email.toLowerCase() } });
        if (!user)
            return ""; // Silent - don't reveal if email exists
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const hashed = crypto_1.default.createHash("sha256").update(token).digest("hex");
        user.resetToken = hashed;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        await userRepo().save(user);
        return token; // Raw token to be sent via email
    },
    async resetPassword(token, newPassword) {
        const hashed = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const user = await userRepo().findOne({ where: { resetToken: hashed } });
        if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry)
            throw (0, errorHandler_1.createError)("Reset token is invalid or expired", 400);
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        await userRepo().save(user);
        await rtRepo().update({ userId: user.id }, { isRevoked: 1 }); // Revoke all tokens
    },
    async changePassword(userId, oldPassword, newPassword) {
        const user = await userRepo().findOne({ where: { id: userId } });
        if (!user)
            throw (0, errorHandler_1.createError)("User not found", 404);
        const valid = await bcryptjs_1.default.compare(oldPassword, user.passwordHash);
        if (!valid)
            throw (0, errorHandler_1.createError)("Current password is incorrect", 400);
        user.passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await userRepo().save(user);
        await rtRepo().update({ userId }, { isRevoked: 1 }); // Force re-login
    },
    async _issueTokens(user, family) {
        const tokenFamily = family || (0, uuid_1.v4)();
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email, role: user.role, warehouseId: user.warehouseId });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, tokenFamily });
        const expiresIn = 15 * 60; // 15 minutes
        const rt = rtRepo().create({
            userId: user.id,
            token: refreshToken,
            tokenFamily,
            expiresAt: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
        });
        await rtRepo().save(rt);
        return { accessToken, refreshToken, expiresIn };
    },
};
//# sourceMappingURL=auth.service.js.map
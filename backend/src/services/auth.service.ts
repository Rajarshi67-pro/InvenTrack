import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../config/jwt";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../middleware/auditLogger";
import type { LoginRequest, RegisterRequest, AuthResponse, AuthTokens } from "../types";

const userRepo = () => AppDataSource.getRepository(User);
const rtRepo = () => AppDataSource.getRepository(RefreshToken);

export const authService = {
  async login(data: LoginRequest, ip?: string): Promise<AuthResponse> {
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
      const tokenFamily = uuidv4();
      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role, warehouseId: user.warehouseId });
      const refreshToken = generateRefreshToken({ userId: user.id, tokenFamily });
      return { user: user as any, tokens: { accessToken, refreshToken, expiresIn: 15 * 60 } };
    }
    // ───────────────────────────────────────────────────────────────────

    const user = await userRepo().findOne({ where: { email: data.email.toLowerCase() } });
    if (!user) throw createError("Invalid email or password", 401);

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
      }
      await userRepo().save(user);
      throw createError("Invalid email or password", 401);
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date();
    await userRepo().save(user);

    const tokens = await authService._issueTokens(user);
    await logAudit({ userId: user.id, action: "LOGIN", entityType: "AUTH", ipAddress: ip, status: "SUCCESS" });

    return {
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role as any, warehouseId: user.warehouseId, lastLogin: user.lastLogin },
      tokens,
    };
  },

  async register(data: RegisterRequest): Promise<User> {
    const existing = await userRepo().findOne({ where: { email: data.email.toLowerCase() } });
    if (existing) throw createError("Email already registered", 409);
    const hash = await bcrypt.hash(data.password, 12);
    const user = userRepo().create({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      passwordHash: hash,
      role: data.role,
      warehouseId: data.warehouseId,
    });
    const saved = await userRepo().save(user);
    await logAudit({ userId: saved.id, action: "REGISTER", entityType: "USER", entityId: saved.id, status: "SUCCESS" });
    return saved;
  },

  async refreshTokens(oldRefreshToken: string): Promise<AuthTokens> {
    let payload: ReturnType<typeof verifyRefreshToken>;
    try { payload = verifyRefreshToken(oldRefreshToken); } catch { throw createError("Invalid refresh token", 401); }

    const rt = await rtRepo().findOne({ where: { token: oldRefreshToken }, relations: ["user"] });
    if (!rt || rt.isRevoked === 1 || rt.isExpired) {
      // Token reuse detected - revoke entire family
      await rtRepo().update({ tokenFamily: payload.tokenFamily }, { isRevoked: 1 });
      throw createError("Refresh token reuse detected. Please log in again.", 401);
    }

    // Rotate: revoke old, issue new
    rt.isRevoked = 1;
    await rtRepo().save(rt);
    return authService._issueTokens(rt.user, payload.tokenFamily);
  },

  async logout(userId: string, refreshToken: string): Promise<void> {
    await rtRepo().update({ userId, token: refreshToken }, { isRevoked: 1 });
  },

  async forgotPassword(email: string): Promise<string> {
    const user = await userRepo().findOne({ where: { email: email.toLowerCase() } });
    if (!user) return ""; // Silent - don't reveal if email exists
    const token = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    user.resetToken = hashed;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await userRepo().save(user);
    return token; // Raw token to be sent via email
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userRepo().findOne({ where: { resetToken: hashed } });
    if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) throw createError("Reset token is invalid or expired", 400);
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await userRepo().save(user);
    await rtRepo().update({ userId: user.id }, { isRevoked: 1 }); // Revoke all tokens
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw createError("User not found", 404);
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) throw createError("Current password is incorrect", 400);
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepo().save(user);
    await rtRepo().update({ userId }, { isRevoked: 1 }); // Force re-login
  },

  async _issueTokens(user: User, family?: string): Promise<AuthTokens> {
    const tokenFamily = family || uuidv4();
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role, warehouseId: user.warehouseId });
    const refreshToken = generateRefreshToken({ userId: user.id, tokenFamily });
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
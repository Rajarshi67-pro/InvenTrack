"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const email_service_1 = require("../services/email.service");
const errorHandler_1 = require("../middleware/errorHandler");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.authController = {
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body, req.ip);
            ok(res, result, "Login successful");
        }
        catch (e) {
            next(e);
        }
    },
    async register(req, res, next) {
        try {
            const user = await auth_service_1.authService.register(req.body);
            ok(res, user.toSafeObject(), "User registered", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken)
                throw (0, errorHandler_1.createError)("Refresh token required", 400);
            const tokens = await auth_service_1.authService.refreshTokens(refreshToken);
            ok(res, { tokens }, "Tokens refreshed");
        }
        catch (e) {
            next(e);
        }
    },
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (req.user && refreshToken)
                await auth_service_1.authService.logout(req.user.userId, refreshToken);
            ok(res, null, "Logged out successfully");
        }
        catch (e) {
            next(e);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            const token = await auth_service_1.authService.forgotPassword(req.body.email);
            if (token)
                await email_service_1.emailService.sendPasswordReset(req.body.email, token);
            ok(res, null, "If the email exists, a reset link has been sent");
        }
        catch (e) {
            next(e);
        }
    },
    async resetPassword(req, res, next) {
        try {
            await auth_service_1.authService.resetPassword(req.body.token, req.body.password);
            ok(res, null, "Password reset successfully");
        }
        catch (e) {
            next(e);
        }
    },
    async changePassword(req, res, next) {
        try {
            await auth_service_1.authService.changePassword(req.user.userId, req.body.oldPassword, req.body.newPassword);
            ok(res, null, "Password changed");
        }
        catch (e) {
            next(e);
        }
    },
    async getMe(req, res, next) {
        try {
            if (req.user.userId === "demo-admin-id")
                return ok(res, { id: "demo-admin-id", fullName: "Demo Admin", email: "admin@inventrack.com", role: "ADMIN", isActive: 1 });
            if (req.user.userId === "demo-manager-id")
                return ok(res, { id: "demo-manager-id", fullName: "Demo Manager", email: "manager@inventrack.com", role: "MANAGER", isActive: 1 });
            const user = await database_1.AppDataSource.getRepository(User_1.User).findOne({ where: { id: req.user.userId } });
            if (!user)
                throw (0, errorHandler_1.createError)("User not found", 404);
            ok(res, user.toSafeObject());
        }
        catch (e) {
            next(e);
        }
    },
    async updateMe(req, res, next) {
        try {
            const repo = database_1.AppDataSource.getRepository(User_1.User);
            const user = await repo.findOne({ where: { id: req.user.userId } });
            if (!user)
                throw (0, errorHandler_1.createError)("Not found", 404);
            const { fullName, phone } = req.body;
            if (fullName)
                user.fullName = fullName;
            if (phone)
                user.phone = phone;
            await repo.save(user);
            ok(res, user.toSafeObject());
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map
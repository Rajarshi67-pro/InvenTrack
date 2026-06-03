"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const database_1 = require("../config/database");
const notification_service_1 = require("../services/notification.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.notificationsController = {
    async getAll(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: [], total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false });
            ok(res, await notification_service_1.notificationService.getByUser(req.user.userId, req.query));
        }
        catch (e) {
            next(e);
        }
    },
    async markRead(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, "Marked as read");
            await notification_service_1.notificationService.markRead(req.params.id, req.user.userId);
            ok(res, null, "Marked as read");
        }
        catch (e) {
            next(e);
        }
    },
    async markAllRead(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, "All marked as read");
            await notification_service_1.notificationService.markAllRead(req.user.userId);
            ok(res, null, "All marked as read");
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, "Deleted");
            await notification_service_1.notificationService.delete(req.params.id, req.user.userId);
            ok(res, null, "Deleted");
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=notifications.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsController = void 0;
const notification_service_1 = require("../services/notification.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.notificationsController = {
    async getAll(req, res, next) { try {
        ok(res, await notification_service_1.notificationService.getByUser(req.user.userId, req.query));
    }
    catch (e) {
        next(e);
    } },
    async markRead(req, res, next) { try {
        await notification_service_1.notificationService.markRead(req.params.id, req.user.userId);
        ok(res, null, "Marked as read");
    }
    catch (e) {
        next(e);
    } },
    async markAllRead(req, res, next) { try {
        await notification_service_1.notificationService.markAllRead(req.user.userId);
        ok(res, null, "All marked as read");
    }
    catch (e) {
        next(e);
    } },
    async delete(req, res, next) { try {
        await notification_service_1.notificationService.delete(req.params.id, req.user.userId);
        ok(res, null, "Deleted");
    }
    catch (e) {
        next(e);
    } },
};
//# sourceMappingURL=notifications.controller.js.map
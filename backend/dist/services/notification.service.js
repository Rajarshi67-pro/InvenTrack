"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const database_1 = require("../config/database");
const Notification_1 = require("../entities/Notification");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const repo = () => database_1.AppDataSource.getRepository(Notification_1.Notification);
exports.notificationService = {
    async create(userId, type, title, message, options) {
        const n = repo().create({ userId, type, title, message, severity: options?.severity || "LOW", entityType: options?.entityType, entityId: options?.entityId });
        return repo().save(n);
    },
    async getByUser(userId, query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const qb = repo().createQueryBuilder("n").where("n.user_id = :userId", { userId }).orderBy("n.created_at", "DESC").skip((page - 1) * limit).take(limit);
        if (query.isRead !== undefined)
            qb.andWhere("n.is_read = :isRead", { isRead: query.isRead });
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 };
    },
    async markRead(id, userId) {
        const n = await repo().findOne({ where: { id, userId } });
        if (!n)
            throw (0, errorHandler_1.createError)("Notification not found", 404);
        n.isRead = 1;
        await repo().save(n);
    },
    async markAllRead(userId) {
        await repo().update({ userId, isRead: 0 }, { isRead: 1 });
    },
    async delete(id, userId) {
        const n = await repo().findOne({ where: { id, userId } });
        if (!n)
            throw (0, errorHandler_1.createError)("Notification not found", 404);
        await repo().remove(n);
    },
    async broadcastToAdmins(type, title, message, severity = "MEDIUM") {
        const admins = await database_1.AppDataSource.getRepository(User_1.User).find({ where: { role: "ADMIN", isActive: 1 } });
        const toSave = admins.map((admin) => repo().create({ userId: admin.id, type, title, message, severity }));
        if (toSave.length > 0)
            await repo().save(toSave);
    },
};
//# sourceMappingURL=notification.service.js.map
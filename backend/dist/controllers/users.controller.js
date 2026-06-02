"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = void 0;
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const repo = () => database_1.AppDataSource.getRepository(User_1.User);
exports.usersController = {
    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 20, search } = req.query;
            const lim = Math.min(Number(limit), 100);
            const qb = repo().createQueryBuilder("u").leftJoinAndSelect("u.warehouse", "warehouse").orderBy("u.created_at", "DESC").skip((Number(page) - 1) * lim).take(lim);
            if (search)
                qb.where("(LOWER(u.full_name) LIKE :s OR LOWER(u.email) LIKE :s)", { s: `%${search.toLowerCase()}%` });
            const [data, total] = await qb.getManyAndCount();
            const p = Number(page);
            ok(res, { data: data.map((u) => u.toSafeObject()), total, page: p, limit: lim, totalPages: Math.ceil(total / lim), hasNext: p < Math.ceil(total / lim), hasPrev: p > 1 });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const u = await repo().findOne({ where: { id: req.params.id }, relations: ["warehouse"] });
            if (!u)
                throw (0, errorHandler_1.createError)("User not found", 404);
            ok(res, u.toSafeObject());
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const u = await repo().findOne({ where: { id: req.params.id } });
            if (!u)
                throw (0, errorHandler_1.createError)("User not found", 404);
            const { fullName, phone, role, warehouseId } = req.body;
            if (fullName)
                u.fullName = fullName;
            if (phone)
                u.phone = phone;
            if (role)
                u.role = role;
            if (warehouseId !== undefined)
                u.warehouseId = warehouseId;
            await repo().save(u);
            ok(res, u.toSafeObject());
        }
        catch (e) {
            next(e);
        }
    },
    async toggleActive(req, res, next) {
        try {
            const u = await repo().findOne({ where: { id: req.params.id } });
            if (!u)
                throw (0, errorHandler_1.createError)("User not found", 404);
            if (u.id === req.user?.userId)
                throw (0, errorHandler_1.createError)("Cannot deactivate yourself", 400);
            u.isActive = u.isActive === 1 ? 0 : 1;
            await repo().save(u);
            ok(res, u.toSafeObject(), `User ${u.isActive ? "activated" : "deactivated"}`);
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=users.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warehousesController = void 0;
const warehouse_service_1 = require("../services/warehouse.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.warehousesController = {
    async getAll(req, res, next) { try {
        ok(res, await warehouse_service_1.warehouseService.getAll(req.query));
    }
    catch (e) {
        next(e);
    } },
    async getById(req, res, next) { try {
        ok(res, await warehouse_service_1.warehouseService.getById(req.params.id));
    }
    catch (e) {
        next(e);
    } },
    async create(req, res, next) { try {
        ok(res, await warehouse_service_1.warehouseService.create(req.body, req.user?.userId), "Warehouse created", 201);
    }
    catch (e) {
        next(e);
    } },
    async update(req, res, next) { try {
        ok(res, await warehouse_service_1.warehouseService.update(req.params.id, req.body, req.user?.userId), "Warehouse updated");
    }
    catch (e) {
        next(e);
    } },
    async delete(req, res, next) { try {
        await warehouse_service_1.warehouseService.delete(req.params.id, req.user?.userId);
        ok(res, null, "Warehouse deleted");
    }
    catch (e) {
        next(e);
    } },
};
//# sourceMappingURL=warehouses.controller.js.map
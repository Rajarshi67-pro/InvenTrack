"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppliersController = void 0;
const supplier_service_1 = require("../services/supplier.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.suppliersController = {
    async getAll(req, res, next) { try {
        ok(res, await supplier_service_1.supplierService.getAll(req.query));
    }
    catch (e) {
        next(e);
    } },
    async getById(req, res, next) { try {
        ok(res, await supplier_service_1.supplierService.getById(req.params.id));
    }
    catch (e) {
        next(e);
    } },
    async create(req, res, next) { try {
        ok(res, await supplier_service_1.supplierService.create(req.body, req.user?.userId), "Supplier created", 201);
    }
    catch (e) {
        next(e);
    } },
    async update(req, res, next) { try {
        ok(res, await supplier_service_1.supplierService.update(req.params.id, req.body, req.user?.userId));
    }
    catch (e) {
        next(e);
    } },
    async delete(req, res, next) { try {
        await supplier_service_1.supplierService.delete(req.params.id, req.user?.userId);
        ok(res, null, "Supplier deleted");
    }
    catch (e) {
        next(e);
    } },
    async getPerformance(req, res, next) { try {
        ok(res, await supplier_service_1.supplierService.getPerformanceAnalytics(req.params.id));
    }
    catch (e) {
        next(e);
    } },
};
//# sourceMappingURL=suppliers.controller.js.map
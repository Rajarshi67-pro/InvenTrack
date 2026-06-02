"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrdersController = void 0;
const purchaseOrder_service_1 = require("../services/purchaseOrder.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.purchaseOrdersController = {
    async getAll(req, res, next) { try {
        ok(res, await purchaseOrder_service_1.purchaseOrderService.getAll(req.query));
    }
    catch (e) {
        next(e);
    } },
    async getById(req, res, next) { try {
        ok(res, await purchaseOrder_service_1.purchaseOrderService.getById(req.params.id));
    }
    catch (e) {
        next(e);
    } },
    async create(req, res, next) { try {
        ok(res, await purchaseOrder_service_1.purchaseOrderService.create(req.body, req.user.userId), "PO created", 201);
    }
    catch (e) {
        next(e);
    } },
    async updateStatus(req, res, next) { try {
        ok(res, await purchaseOrder_service_1.purchaseOrderService.updateStatus(req.params.id, req.body.status, req.user.userId, req.body.notes));
    }
    catch (e) {
        next(e);
    } },
    async delete(req, res, next) { try {
        await purchaseOrder_service_1.purchaseOrderService.delete(req.params.id, req.user.userId);
        ok(res, null, "PO deleted");
    }
    catch (e) {
        next(e);
    } },
};
//# sourceMappingURL=purchaseOrders.controller.js.map
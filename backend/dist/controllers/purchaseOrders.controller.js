"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrdersController = void 0;
const database_1 = require("../config/database");
const purchaseOrder_service_1 = require("../services/purchaseOrder.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_POS = [
    { id: "demo-po1", poNumber: "PO-2026-001", supplierId: "demo-s1", supplierName: "TechCorp Industries", status: "APPROVED", totalAmount: 15499.50, expectedDelivery: "2026-06-15", createdAt: new Date().toISOString() },
    { id: "demo-po2", poNumber: "PO-2026-002", supplierId: "demo-s2", supplierName: "Global Supply Chain Ltd", status: "ORDERED", totalAmount: 8220.00, expectedDelivery: "2026-06-20", createdAt: new Date().toISOString() },
    { id: "demo-po3", poNumber: "PO-2026-003", supplierId: "demo-s3", supplierName: "FastLogistics Co.", status: "DRAFT", totalAmount: 3360.00, expectedDelivery: "2026-06-25", createdAt: new Date().toISOString() },
];
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.purchaseOrdersController = {
    async getAll(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: MOCK_POS, total: MOCK_POS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
            ok(res, await purchaseOrder_service_1.purchaseOrderService.getAll(req.query));
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            if (dbDown())
                return ok(res, MOCK_POS.find(p => p.id === req.params.id) || MOCK_POS[0]);
            ok(res, await purchaseOrder_service_1.purchaseOrderService.getById(req.params.id));
        }
        catch (e) {
            next(e);
        }
    },
    async create(req, res, next) {
        try {
            if (dbDown()) {
                const newItem = { id: `demo-po-${Date.now()}`, poNumber: `PO-${Date.now()}`, ...req.body, status: "DRAFT", createdAt: new Date().toISOString().split('T')[0] };
                MOCK_POS.unshift(newItem);
                return ok(res, newItem, "PO created (demo mode)", 201);
            }
            ok(res, await purchaseOrder_service_1.purchaseOrderService.create(req.body, req.user.userId), "PO created", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async updateStatus(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { id: req.params.id, status: req.body.status }, "Status updated");
            ok(res, await purchaseOrder_service_1.purchaseOrderService.updateStatus(req.params.id, req.body.status, req.user.userId, req.body.notes));
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, "PO deleted");
            await purchaseOrder_service_1.purchaseOrderService.delete(req.params.id, req.user.userId);
            ok(res, null, "PO deleted");
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=purchaseOrders.controller.js.map
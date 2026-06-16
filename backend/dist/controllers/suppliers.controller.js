"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppliersController = void 0;
const database_1 = require("../config/database");
const supplier_service_1 = require("../services/supplier.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_SUPPLIERS = [
    { id: "demo-s1", name: "TechCorp Industries", contactName: "Rahul Sharma", email: "rahul@techcorp.in", phone: "+91-9876543210", country: "India", deliveryPerformance: 98, rating: 4.8, isActive: 1 },
    { id: "demo-s2", name: "Global Supply Chain Ltd", contactName: "Priya Mehta", email: "priya@globalsupply.com", phone: "+91-9123456789", country: "India", deliveryPerformance: 92, rating: 4.2, isActive: 1 },
    { id: "demo-s3", name: "FastLogistics Co.", contactName: "Amit Bose", email: "amit@fastlogistics.in", phone: "+91-9988776655", country: "India", deliveryPerformance: 85, rating: 3.9, isActive: 1 },
    { id: "demo-s4", name: "Allied Manufacturing", contactName: "Sneha Roy", email: "sneha@alliedmfg.com", phone: "+91-9000112233", country: "India", deliveryPerformance: 76, rating: 3.5, isActive: 1 },
];
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.suppliersController = {
    async getAll(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: MOCK_SUPPLIERS, total: MOCK_SUPPLIERS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
            ok(res, await supplier_service_1.supplierService.getAll(req.query));
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            if (dbDown())
                return ok(res, MOCK_SUPPLIERS.find(s => s.id === req.params.id) || MOCK_SUPPLIERS[0]);
            ok(res, await supplier_service_1.supplierService.getById(req.params.id));
        }
        catch (e) {
            next(e);
        }
    },
    async create(req, res, next) {
        try {
            if (dbDown()) {
                const newItem = { id: `demo-s-${Date.now()}`, ...req.body, deliveryPerformance: 100, rating: 5.0, isActive: 1 };
                MOCK_SUPPLIERS.unshift(newItem);
                return ok(res, newItem, "Supplier created (demo mode)", 201);
            }
            ok(res, await supplier_service_1.supplierService.create(req.body, req.user?.userId), "Supplier created", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { id: req.params.id, ...req.body }, "Supplier updated");
            ok(res, await supplier_service_1.supplierService.update(req.params.id, req.body, req.user?.userId));
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, "Supplier deleted");
            await supplier_service_1.supplierService.delete(req.params.id, req.user?.userId);
            ok(res, null, "Supplier deleted");
        }
        catch (e) {
            next(e);
        }
    },
    async getPerformance(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { onTimeDelivery: 88, qualityScore: 92, fillRate: 95 });
            ok(res, await supplier_service_1.supplierService.getPerformanceAnalytics(req.params.id));
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=suppliers.controller.js.map
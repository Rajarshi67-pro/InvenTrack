"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warehousesController = void 0;
const database_1 = require("../config/database");
const warehouse_service_1 = require("../services/warehouse.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_WAREHOUSES = [
    { id: "demo-w1", name: "Main Distribution Hub", location: "Mumbai", capacity: 5000, currentStock: 4200, utilizationPercent: 84, isActive: 1 },
    { id: "demo-w2", name: "East Wing Storage", location: "Kolkata", capacity: 3000, currentStock: 1350, utilizationPercent: 45, isActive: 1 },
    { id: "demo-w3", name: "West Coast Depot", location: "Pune", capacity: 4000, currentStock: 2880, utilizationPercent: 72, isActive: 1 },
    { id: "demo-w4", name: "North Regional Centre", location: "Delhi", capacity: 2500, currentStock: 1025, utilizationPercent: 41, isActive: 1 },
];
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.warehousesController = {
    async getAll(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: MOCK_WAREHOUSES, total: MOCK_WAREHOUSES.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
            ok(res, await warehouse_service_1.warehouseService.getAll(req.query));
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            if (dbDown())
                return ok(res, MOCK_WAREHOUSES.find(w => w.id === req.params.id) || MOCK_WAREHOUSES[0]);
            ok(res, await warehouse_service_1.warehouseService.getById(req.params.id));
        }
        catch (e) {
            next(e);
        }
    },
    async create(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { id: "demo-new", ...req.body }, "Warehouse created (demo mode)", 201);
            ok(res, await warehouse_service_1.warehouseService.create(req.body, req.user?.userId), "Warehouse created", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { id: req.params.id, ...req.body }, "Warehouse updated");
            ok(res, await warehouse_service_1.warehouseService.update(req.params.id, req.body, req.user?.userId), "Warehouse updated");
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, "Warehouse deleted");
            await warehouse_service_1.warehouseService.delete(req.params.id, req.user?.userId);
            ok(res, null, "Warehouse deleted");
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=warehouses.controller.js.map
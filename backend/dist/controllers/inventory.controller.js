"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = void 0;
const database_1 = require("../config/database");
const inventory_service_1 = require("../services/inventory.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_MOVEMENTS = [
    { id: "demo-m1", type: "IN", productName: "Industrial Valve XL-500", quantity: 100, warehouseName: "Main Distribution Hub", createdAt: new Date().toISOString() },
    { id: "demo-m2", type: "OUT", productName: "Safety Helmet Pro", quantity: 25, warehouseName: "West Coast Depot", createdAt: new Date().toISOString() },
    { id: "demo-m3", type: "IN", productName: "Electric Motor EM-750W", quantity: 15, warehouseName: "North Regional Centre", createdAt: new Date().toISOString() },
];
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.inventoryController = {
    async stockIn(req, res, next) {
        try {
            if (dbDown()) {
                const newItem = { id: `demo-m-${Date.now()}`, type: "IN", ...req.body, createdAt: new Date().toISOString() };
                MOCK_MOVEMENTS.unshift(newItem);
                return ok(res, newItem, "Stock in recorded (demo mode)", 201);
            }
            ok(res, await inventory_service_1.inventoryService.stockIn(req.body, req.user.userId), "Stock in recorded", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async stockOut(req, res, next) {
        try {
            if (dbDown()) {
                const newItem = { id: `demo-m-${Date.now()}`, type: "OUT", ...req.body, createdAt: new Date().toISOString() };
                MOCK_MOVEMENTS.unshift(newItem);
                return ok(res, newItem, "Stock out recorded (demo mode)", 201);
            }
            ok(res, await inventory_service_1.inventoryService.stockOut(req.body, req.user.userId), "Stock out recorded", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async transfer(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, "Transfer completed (demo mode)");
            await inventory_service_1.inventoryService.transfer(req.body, req.user.userId);
            ok(res, null, "Transfer completed");
        }
        catch (e) {
            next(e);
        }
    },
    async adjustment(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { id: "demo-new", ...req.body }, "Adjustment recorded (demo mode)");
            ok(res, await inventory_service_1.inventoryService.adjustment(req.body, req.user.userId), "Adjustment recorded");
        }
        catch (e) {
            next(e);
        }
    },
    async getMovements(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: MOCK_MOVEMENTS, total: MOCK_MOVEMENTS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
            ok(res, await inventory_service_1.inventoryService.getMovements(req.query));
        }
        catch (e) {
            next(e);
        }
    },
    async getLevels(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: MOCK_MOVEMENTS, total: MOCK_MOVEMENTS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
            ok(res, await inventory_service_1.inventoryService.getMovements({ ...req.query, type: undefined }));
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=inventory.controller.js.map
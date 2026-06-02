"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.inventoryController = {
    async stockIn(req, res, next) { try {
        ok(res, await inventory_service_1.inventoryService.stockIn(req.body, req.user.userId), "Stock in recorded", 201);
    }
    catch (e) {
        next(e);
    } },
    async stockOut(req, res, next) { try {
        ok(res, await inventory_service_1.inventoryService.stockOut(req.body, req.user.userId), "Stock out recorded", 201);
    }
    catch (e) {
        next(e);
    } },
    async transfer(req, res, next) { try {
        await inventory_service_1.inventoryService.transfer(req.body, req.user.userId);
        ok(res, null, "Transfer completed");
    }
    catch (e) {
        next(e);
    } },
    async adjustment(req, res, next) { try {
        ok(res, await inventory_service_1.inventoryService.adjustment(req.body, req.user.userId), "Adjustment recorded");
    }
    catch (e) {
        next(e);
    } },
    async getMovements(req, res, next) { try {
        ok(res, await inventory_service_1.inventoryService.getMovements(req.query));
    }
    catch (e) {
        next(e);
    } },
    async getLevels(req, res, next) { try {
        ok(res, await inventory_service_1.inventoryService.getMovements({ ...req.query, type: undefined }));
    }
    catch (e) {
        next(e);
    } },
};
//# sourceMappingURL=inventory.controller.js.map
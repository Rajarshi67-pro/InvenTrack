"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockTransfersController = void 0;
const database_1 = require("../config/database");
const ok = (res, data, message = 'Success', status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_TRANSFERS = [
    { id: 'demo-t1', fromWarehouseId: 'demo-w1', toWarehouseId: 'demo-w2', productId: 'demo-p1', productName: 'Industrial Valve XL-500', quantity: 50, status: 'COMPLETED', createdAt: new Date().toISOString() },
    { id: 'demo-t2', fromWarehouseId: 'demo-w3', toWarehouseId: 'demo-w1', productId: 'demo-p4', productName: 'Safety Helmet Pro', quantity: 25, status: 'PENDING', createdAt: new Date().toISOString() },
];
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.stockTransfersController = {
    async getAll(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: MOCK_TRANSFERS, total: MOCK_TRANSFERS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
            ok(res, { data: [], total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false });
        }
        catch (e) {
            next(e);
        }
    },
    async create(req, res, next) {
        try {
            if (dbDown()) {
                const newItem = { id: `demo-t-${Date.now()}`, ...req.body, status: 'PENDING', createdAt: new Date().toISOString() };
                MOCK_TRANSFERS.unshift(newItem);
                return ok(res, newItem, 'Transfer initiated (demo mode)', 201);
            }
            ok(res, { id: 'demo-new', ...req.body, status: 'PENDING' }, 'Transfer initiated', 201);
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=stockTransfers.controller.js.map
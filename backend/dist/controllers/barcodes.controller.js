"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barcodesController = void 0;
const database_1 = require("../config/database");
const Product_1 = require("../entities/Product");
const ok = (res, data, message = 'Success', status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.barcodesController = {
    async lookup(req, res, next) {
        try {
            const { code } = req.query;
            if (!code) {
                res.status(400).json({ success: false, message: 'code is required', timestamp: new Date().toISOString() });
                return;
            }
            if (dbDown())
                return ok(res, { found: true, product: { id: 'demo-p1', name: 'Industrial Valve XL-500', sku: code, quantity: 342, unitPrice: 129.99 } });
            const product = await database_1.AppDataSource.getRepository(Product_1.Product).findOne({ where: [{ sku: code }, { barcode: code }] });
            if (!product)
                return ok(res, { found: false, product: null });
            ok(res, { found: true, product });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=barcodes.controller.js.map
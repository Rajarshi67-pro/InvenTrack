"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsController = void 0;
const product_service_1 = require("../services/product.service");
const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
exports.productsController = {
    async getAll(req, res, next) { try {
        ok(res, await product_service_1.productService.getAll(req.query));
    }
    catch (e) {
        next(e);
    } },
    async getById(req, res, next) { try {
        ok(res, await product_service_1.productService.getById(req.params.id));
    }
    catch (e) {
        next(e);
    } },
    async create(req, res, next) { try {
        ok(res, await product_service_1.productService.create(req.body, req.user?.userId), "Product created", 201);
    }
    catch (e) {
        next(e);
    } },
    async update(req, res, next) { try {
        ok(res, await product_service_1.productService.update(req.params.id, req.body, req.user?.userId));
    }
    catch (e) {
        next(e);
    } },
    async delete(req, res, next) { try {
        await product_service_1.productService.delete(req.params.id, req.user?.userId);
        ok(res, null, "Product deleted");
    }
    catch (e) {
        next(e);
    } },
    async getByBarcode(req, res, next) { try {
        ok(res, await product_service_1.productService.getByBarcode(req.query.barcode));
    }
    catch (e) {
        next(e);
    } },
    async getLowStock(req, res, next) { try {
        ok(res, await product_service_1.productService.getLowStock());
    }
    catch (e) {
        next(e);
    } },
};
//# sourceMappingURL=products.controller.js.map
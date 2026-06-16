"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipmentsController = void 0;
const database_1 = require("../config/database");
const Shipment_1 = require("../entities/Shipment");
const ok = (res, data, message = 'Success', status = 200) => res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
const MOCK_SHIPMENTS = [
    { id: 'demo-sh1', shipmentNumber: 'SHP-2026-001', type: 'INBOUND', status: 'IN_TRANSIT', carrier: 'BlueDart', trackingNumber: 'BD123456789', expectedDelivery: '2026-06-10', supplierId: 'demo-s1', warehouseId: 'demo-w1', createdAt: new Date().toISOString() },
    { id: 'demo-sh2', shipmentNumber: 'SHP-2026-002', type: 'OUTBOUND', status: 'DISPATCHED', carrier: 'Delhivery', trackingNumber: 'DL987654321', expectedDelivery: '2026-06-08', warehouseId: 'demo-w2', createdAt: new Date().toISOString() },
    { id: 'demo-sh3', shipmentNumber: 'SHP-2026-003', type: 'INBOUND', status: 'DELIVERED', carrier: 'FedEx', trackingNumber: 'FX111222333', expectedDelivery: '2026-06-01', actualDelivery: '2026-06-01', warehouseId: 'demo-w3', createdAt: new Date().toISOString() },
];
const dbDown = () => !database_1.AppDataSource.isInitialized;
exports.shipmentsController = {
    async getAll(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { data: MOCK_SHIPMENTS, total: MOCK_SHIPMENTS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
            const repo = database_1.AppDataSource.getRepository(Shipment_1.Shipment);
            const { page = 1, limit = 20, status, type } = req.query;
            const lim = Math.min(Number(limit), 100);
            const qb = repo.createQueryBuilder('s').orderBy('s.created_at', 'DESC').skip((Number(page) - 1) * lim).take(lim);
            if (status)
                qb.andWhere('s.status = :status', { status });
            if (type)
                qb.andWhere('s.type = :type', { type });
            const [data, total] = await qb.getManyAndCount();
            const p = Number(page);
            ok(res, { data, total, page: p, limit: lim, totalPages: Math.ceil(total / lim), hasNext: p < Math.ceil(total / lim), hasPrev: p > 1 });
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            if (dbDown())
                return ok(res, MOCK_SHIPMENTS.find(s => s.id === req.params.id) || MOCK_SHIPMENTS[0]);
            const shipment = await database_1.AppDataSource.getRepository(Shipment_1.Shipment).findOne({ where: { id: req.params.id } });
            if (!shipment) {
                res.status(404).json({ success: false, message: 'Shipment not found', timestamp: new Date().toISOString() });
                return;
            }
            ok(res, shipment);
        }
        catch (e) {
            next(e);
        }
    },
    async create(req, res, next) {
        try {
            if (dbDown()) {
                const newItem = { id: `demo-sh-${Date.now()}`, shipmentNumber: `SHP-${Date.now()}`, ...req.body, status: 'CREATED', createdAt: new Date().toISOString() };
                MOCK_SHIPMENTS.unshift(newItem);
                return ok(res, newItem, 'Shipment created (demo mode)', 201);
            }
            const repo = database_1.AppDataSource.getRepository(Shipment_1.Shipment);
            const count = await repo.count();
            const shipment = repo.create({ ...req.body, shipmentNumber: `SHP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`, createdBy: req.user?.userId });
            const saved = await repo.save(shipment);
            ok(res, saved, 'Shipment created', 201);
        }
        catch (e) {
            next(e);
        }
    },
    async updateStatus(req, res, next) {
        try {
            if (dbDown())
                return ok(res, { id: req.params.id, status: req.body.status });
            const repo = database_1.AppDataSource.getRepository(Shipment_1.Shipment);
            const shipment = await repo.findOne({ where: { id: req.params.id } });
            if (!shipment) {
                res.status(404).json({ success: false, message: 'Shipment not found', timestamp: new Date().toISOString() });
                return;
            }
            shipment.status = req.body.status;
            if (req.body.status === 'DELIVERED')
                shipment.actualDelivery = new Date();
            if (req.body.trackingNumber)
                shipment.trackingNumber = req.body.trackingNumber;
            if (req.body.carrier)
                shipment.carrier = req.body.carrier;
            const saved = await repo.save(shipment);
            ok(res, saved, 'Status updated');
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            if (dbDown())
                return ok(res, null, 'Shipment deleted');
            await database_1.AppDataSource.getRepository(Shipment_1.Shipment).delete(req.params.id);
            ok(res, null, 'Shipment deleted');
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=shipments.controller.js.map
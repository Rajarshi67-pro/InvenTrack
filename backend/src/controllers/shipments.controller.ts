import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Shipment } from '../entities/Shipment';
import type { ApiResponse } from '../types';

const ok = <T>(res: Response, data: T, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() } as ApiResponse<T>);

const MOCK_SHIPMENTS = [
  { id: 'demo-sh1', shipmentNumber: 'SHP-2026-001', type: 'INBOUND', status: 'IN_TRANSIT', carrier: 'BlueDart', trackingNumber: 'BD123456789', expectedDelivery: '2026-06-10', supplierId: 'demo-s1', warehouseId: 'demo-w1', createdAt: new Date().toISOString() },
  { id: 'demo-sh2', shipmentNumber: 'SHP-2026-002', type: 'OUTBOUND', status: 'DISPATCHED', carrier: 'Delhivery', trackingNumber: 'DL987654321', expectedDelivery: '2026-06-08', warehouseId: 'demo-w2', createdAt: new Date().toISOString() },
  { id: 'demo-sh3', shipmentNumber: 'SHP-2026-003', type: 'INBOUND', status: 'DELIVERED', carrier: 'FedEx', trackingNumber: 'FX111222333', expectedDelivery: '2026-06-01', actualDelivery: '2026-06-01', warehouseId: 'demo-w3', createdAt: new Date().toISOString() },
];

const dbDown = () => !AppDataSource.isInitialized;

export const shipmentsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { data: MOCK_SHIPMENTS, total: MOCK_SHIPMENTS.length, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false });
      const repo = AppDataSource.getRepository(Shipment);
      const { page = 1, limit = 20, status, type } = req.query as Record<string, string>;
      const lim = Math.min(Number(limit), 100);
      const qb = repo.createQueryBuilder('s').orderBy('s.created_at', 'DESC').skip((Number(page) - 1) * lim).take(lim);
      if (status) qb.andWhere('s.status = :status', { status });
      if (type) qb.andWhere('s.type = :type', { type });
      const [data, total] = await qb.getManyAndCount();
      const p = Number(page);
      ok(res, { data, total, page: p, limit: lim, totalPages: Math.ceil(total / lim), hasNext: p < Math.ceil(total / lim), hasPrev: p > 1 });
    } catch (e) { next(e); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, MOCK_SHIPMENTS.find(s => s.id === req.params.id) || MOCK_SHIPMENTS[0]);
      const shipment = await AppDataSource.getRepository(Shipment).findOne({ where: { id: req.params.id } });
      if (!shipment) { res.status(404).json({ success: false, message: 'Shipment not found', timestamp: new Date().toISOString() }); return; }
      ok(res, shipment);
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: 'demo-new', shipmentNumber: `SHP-2026-${Date.now()}`, ...req.body, status: 'CREATED' }, 'Shipment created (demo mode)', 201);
      const repo = AppDataSource.getRepository(Shipment);
      const count = await repo.count();
      const shipment = repo.create({ ...req.body, shipmentNumber: `SHP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`, createdBy: req.user?.userId });
      const saved = await repo.save(shipment);
      ok(res, saved, 'Shipment created', 201);
    } catch (e) { next(e); }
  },
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, { id: req.params.id, status: req.body.status });
      const repo = AppDataSource.getRepository(Shipment);
      const shipment = await repo.findOne({ where: { id: req.params.id } });
      if (!shipment) { res.status(404).json({ success: false, message: 'Shipment not found', timestamp: new Date().toISOString() }); return; }
      shipment.status = req.body.status;
      if (req.body.status === 'DELIVERED') shipment.actualDelivery = new Date();
      if (req.body.trackingNumber) shipment.trackingNumber = req.body.trackingNumber;
      if (req.body.carrier) shipment.carrier = req.body.carrier;
      const saved = await repo.save(shipment);
      ok(res, saved, 'Status updated');
    } catch (e) { next(e); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (dbDown()) return ok(res, null, 'Shipment deleted');
      await AppDataSource.getRepository(Shipment).delete(req.params.id);
      ok(res, null, 'Shipment deleted');
    } catch (e) { next(e); }
  },
};

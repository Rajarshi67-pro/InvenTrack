import { Router } from 'express';
import { shipmentsController } from '../controllers/shipments.controller';
import { authenticate } from '../middleware/authenticate';
import { requireManagerOrAdmin } from '../middleware/rbac';

const router = Router();
router.use(authenticate);
router.get('/', requireManagerOrAdmin, shipmentsController.getAll);
router.get('/:id', requireManagerOrAdmin, shipmentsController.getById);
router.post('/', requireManagerOrAdmin, shipmentsController.create);
router.patch('/:id/status', requireManagerOrAdmin, shipmentsController.updateStatus);
router.delete('/:id', requireManagerOrAdmin, shipmentsController.delete);
export default router;

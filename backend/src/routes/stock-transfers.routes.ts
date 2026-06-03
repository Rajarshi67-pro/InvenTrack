import { Router } from 'express';
import { stockTransfersController } from '../controllers/stockTransfers.controller';
import { authenticate } from '../middleware/authenticate';
import { requireManagerOrAdmin } from '../middleware/rbac';

const router = Router();
router.use(authenticate);
router.get('/', requireManagerOrAdmin, stockTransfersController.getAll);
router.post('/', requireManagerOrAdmin, stockTransfersController.create);
export default router;

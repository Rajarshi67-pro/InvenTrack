import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/rbac';

const router = Router();
router.use(authenticate);
router.get('/', settingsController.get);
router.put('/', requireAdmin, settingsController.update);
export default router;

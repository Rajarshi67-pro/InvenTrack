import { Router } from 'express';
import { barcodesController } from '../controllers/barcodes.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);
router.get('/lookup', barcodesController.lookup);
export default router;

import { Router } from 'express';
import { alertController } from '../controllers/alert.controller';
import { requireShopAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/api/alerts', requireShopAuth, alertController.listAlerts);
router.post('/api/alerts/:id/resolve', requireShopAuth, alertController.resolveAlert);

export default router;

import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { requireShopAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/api/settings', requireShopAuth, settingsController.getSettings);
router.put('/api/settings', requireShopAuth, settingsController.updateSettings);

export default router;

import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { requireShopAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/api/activity', requireShopAuth, activityController.getActivityLogs);

export default router;

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireShopAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/api/dashboard', requireShopAuth, dashboardController.getDashboardData);

export default router;

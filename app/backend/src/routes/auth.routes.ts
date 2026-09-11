import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireShopAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/auth', authController.install);
router.get('/auth/callback', authController.callback);
router.get('/api/session', requireShopAuth, authController.session);

export default router;

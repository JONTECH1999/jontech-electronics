import { Router } from 'express';
import { requireShopAuth } from '../middleware/auth.middleware';
import { customerController } from '../controllers/customer.controller';

const router = Router();

router.use(requireShopAuth);

router.get('/api/customers', customerController.getCustomers);
router.get('/api/customers/:id', customerController.getCustomerById);
router.post('/api/customers/sync', customerController.syncCustomers);

export default router;

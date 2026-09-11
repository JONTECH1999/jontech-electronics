import { Router } from 'express';
import { bundleController } from '../controllers/bundle.controller';
import { requireShopAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { createBundleSchema, updateBundleSchema } from '../validators/bundle.validator';

const router = Router();

// Protect all bundle endpoints with shop context isolation
router.use(requireShopAuth);

router.get('/api/bundles', bundleController.listBundles);
router.get('/api/bundles/:id', bundleController.getBundle);
router.post('/api/bundles', validateBody(createBundleSchema), bundleController.createBundle);
router.put('/api/bundles/:id', validateBody(updateBundleSchema), bundleController.updateBundle);
router.delete('/api/bundles/:id', bundleController.deleteBundle);

// Deterministic recalculation & AI Analysis
router.post('/api/bundles/:id/recalculate', bundleController.recalculateScore);
router.post('/api/bundles/:id/analyze', bundleController.analyzeWithAi);

// Shopify Catalog retrieval for bundle product selector
router.get('/api/shopify/products', bundleController.getShopifyProducts);

export default router;

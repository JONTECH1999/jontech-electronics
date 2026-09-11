import { Request, Response } from 'express';
import { bundleService } from '../services/bundles/bundle.service';
import { bundleAnalysisService } from '../services/ai/bundle-analysis.service';
import { shopifyProductsService } from '../services/shopify/products.service';

export const bundleController = {
  async listBundles(req: Request, res: Response) {
    const session = req.shopSession!;
    const { status, q } = req.query;

    let bundles = await bundleService.getBundles(session);

    if (status && typeof status === 'string' && status !== 'all') {
      bundles = bundles.filter(b => b.status === status);
    }

    if (q && typeof q === 'string' && q.trim() !== '') {
      const search = q.toLowerCase();
      bundles = bundles.filter(b => b.name.toLowerCase().includes(search) || b.targetCategory.toLowerCase().includes(search));
    }

    res.json({
      success: true,
      bundles
    });
  },

  async getBundle(req: Request, res: Response) {
    const session = req.shopSession!;
    const { id } = req.params;

    const bundle = await bundleService.getBundleById(session, id);
    if (!bundle) {
      return res.status(404).json({ success: false, error: 'Bundle not found' });
    }

    res.json({
      success: true,
      bundle
    });
  },

  async createBundle(req: Request, res: Response) {
    const session = req.shopSession!;
    const bundle = await bundleService.createBundle(session, req.body);

    res.status(201).json({
      success: true,
      message: 'Bundle created and scored successfully',
      bundle
    });
  },

  async updateBundle(req: Request, res: Response) {
    const session = req.shopSession!;
    const { id } = req.params;

    const updated = await bundleService.updateBundle(session, id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Bundle not found' });
    }

    res.json({
      success: true,
      message: 'Bundle updated successfully',
      bundle: updated
    });
  },

  async deleteBundle(req: Request, res: Response) {
    const session = req.shopSession!;
    const { id } = req.params;

    const success = await bundleService.deleteBundle(session, id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Bundle not found' });
    }

    res.json({
      success: true,
      message: 'Bundle deleted successfully'
    });
  },

  async recalculateScore(req: Request, res: Response) {
    const session = req.shopSession!;
    const { id } = req.params;

    const score = await bundleService.recalculateScore(session, id);
    if (!score) {
      return res.status(404).json({ success: false, error: 'Bundle not found' });
    }

    const bundle = await bundleService.getBundleById(session, id);

    res.json({
      success: true,
      message: 'Score recalculated successfully',
      score,
      bundle
    });
  },

  async analyzeWithAi(req: Request, res: Response) {
    const session = req.shopSession!;
    const { id } = req.params;

    const bundle = await bundleService.getBundleById(session, id);
    if (!bundle) {
      return res.status(404).json({ success: false, error: 'Bundle not found' });
    }

    try {
      const analysis = await bundleAnalysisService.runAnalysis(session, bundle);
      res.json({
        success: true,
        message: 'AI analysis generated successfully',
        analysis
      });
    } catch (err: any) {
      console.error('AI analysis failure:', err.message);
      res.status(503).json({
        success: false,
        error: 'AI analysis is currently unavailable. Your bundle score and alerts remain active.',
        details: err.message
      });
    }
  },

  async getShopifyProducts(req: Request, res: Response) {
    const session = req.shopSession!;
    const result = await shopifyProductsService.getProductsWithMetadata(session);

    res.json({
      success: true,
      products: result.products,
      isDemoData: result.isDemoData,
      apiVersion: result.apiVersion
    });
  }
};

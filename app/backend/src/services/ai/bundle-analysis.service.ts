import { ShopSession, BundleDto, AiBundleAnalysisResult } from '../../types';
import { dbRepository } from '../../db';
import { shopifyInventoryService } from '../shopify/inventory.service';
import { buildBundleAnalysisPrompt } from './prompts/bundle-analysis.prompt';
import { anthropicService } from './anthropic.service';
import { env } from '../../config/env';

export const bundleAnalysisService = {
  /**
   * Orchestrates the complete AI Bundle Analysis workflow
   */
  async runAnalysis(session: ShopSession, bundle: BundleDto): Promise<AiBundleAnalysisResult> {
    // 1. Gather inventory telemetry and active alerts
    const [inventoryHealth, alerts] = await Promise.all([
      shopifyInventoryService.evaluateBundleInventory(session, bundle.items),
      dbRepository.getAlertsByBundle(bundle.id, session.shopId)
    ]);

    // 2. Build structured prompt
    const bundleData = {
      bundleName: bundle.name,
      category: bundle.targetCategory,
      discountPercent: bundle.discountPercent,
      totalScore: bundle.score?.totalScore ?? 75,
      salesScore: bundle.score?.salesScore ?? 70,
      compatibilityScore: bundle.score?.compatibilityScore ?? 80,
      inventoryScore: bundle.score?.inventoryScore ?? 75,
      discountScore: bundle.score?.discountScore ?? 75,
      items: bundle.items.map(i => ({
        title: i.productTitle,
        price: i.price,
        quantity: i.quantity
      })),
      inventoryStatus: {
        lowestStock: inventoryHealth.lowestStock,
        criticalCount: inventoryHealth.criticalItems.length,
        warningCount: inventoryHealth.warningItems.length
      },
      activeAlerts: alerts.filter(a => a.status === 'active').map(a => ({
        title: a.title,
        severity: a.severity,
        message: a.message
      }))
    };

    const { system, user } = buildBundleAnalysisPrompt(bundleData);

    // 3. Call Anthropic server-side client
    const { result, rawResponse } = await anthropicService.generateAnalysis(system, user, bundleData);

    // 4. Persist analysis to database
    await dbRepository.saveAiAnalysis(bundle.id, result, result.model || env.ANTHROPIC_MODEL, rawResponse);

    // 5. Create activity audit log
    await dbRepository.createActivityLog(session.shopId, {
      bundleId: bundle.id,
      action: 'ai_analysis_generated',
      description: `AI Bundle Analysis generated for "${bundle.name}" with Claude.`,
      metadata: { model: result.model || env.ANTHROPIC_MODEL }
    });

    return result;
  }
};

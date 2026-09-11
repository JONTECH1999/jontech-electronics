import { ShopSession, BundleDto, ScoreFactors, ScoreBreakdown } from '../../types';
import { shopifyProductsService } from '../shopify/products.service';
import { shopifyOrdersService } from '../shopify/orders.service';
import { shopifyInventoryService } from '../shopify/inventory.service';
import {
  DEFAULT_WEIGHTS,
  FactorWeights,
  calculateSalesScore,
  calculateCompatibilityScore,
  calculateInventoryScore,
  calculateDiscountScore
} from './score-factors';
import { dbRepository } from '../../db';

export const bundleScoreService = {
  /**
   * Evaluates and computes deterministic scores for a product bundle
   */
  async scoreBundle(session: ShopSession, bundle: BundleDto, customWeights?: Partial<FactorWeights>): Promise<ScoreBreakdown> {
    const weights: FactorWeights = { ...DEFAULT_WEIGHTS, ...customWeights };

    // 1. Gather live or mock Shopify metrics
    const [productsCatalog, salesMetrics, inventoryHealth] = await Promise.all([
      shopifyProductsService.getProducts(session),
      shopifyOrdersService.getBundleSalesMetrics(session, bundle.items),
      shopifyInventoryService.evaluateBundleInventory(session, bundle.items)
    ]);

    // 2. Deterministic factor calculations (each 0 - 100)
    const salesScore = calculateSalesScore(salesMetrics);
    const compatibilityScore = calculateCompatibilityScore(bundle.items, productsCatalog);
    const inventoryScore = calculateInventoryScore(
      inventoryHealth.lowestStock,
      inventoryHealth.criticalItems.length,
      inventoryHealth.stockHealthRatio
    );
    const discountScore = calculateDiscountScore(bundle.discountPercent || 0);

    // 3. Compute weighted total score (0 - 100)
    const rawTotal =
      salesScore * weights.salesWeight +
      compatibilityScore * weights.compatibilityWeight +
      inventoryScore * weights.inventoryWeight +
      discountScore * weights.discountWeight;

    const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal * 100) / 100));

    const breakdown: ScoreBreakdown = {
      salesScore,
      compatibilityScore,
      inventoryScore,
      discountScore,
      totalScore,
      version: 'v1.0',
      salesMetrics: {
        coOrderFrequency: salesMetrics.coOrderFrequency,
        combinedVelocity: salesMetrics.combinedVelocity,
        totalOrdersEvaluated: salesMetrics.totalOrdersEvaluated
      },
      compatibilityMetrics: {
        categorySynergy: compatibilityScore,
        useCaseOverlap: Math.round(compatibilityScore * 0.9)
      },
      inventoryMetrics: {
        lowestStock: inventoryHealth.lowestStock,
        criticalItemCount: inventoryHealth.criticalItems.length,
        stockHealthRatio: inventoryHealth.stockHealthRatio
      },
      discountMetrics: {
        discountPercent: bundle.discountPercent,
        efficiencyRating: discountScore >= 90 ? 'Optimal' : (discountScore >= 75 ? 'Good' : 'Suboptimal')
      }
    };

    // 4. Save score to database
    await dbRepository.saveBundleScore(bundle.id, {
      salesScore,
      compatibilityScore,
      inventoryScore,
      discountScore,
      totalScore
    }, breakdown);

    return breakdown;
  },

  /**
   * Sorts bundles in descending order by calculated total score
   * Required logic-based ranking workflow
   */
  rankBundles(bundles: BundleDto[]): Array<BundleDto & { rank: number }> {
    if (!bundles || bundles.length === 0) return [];

    const sorted = [...bundles].sort((a, b) => {
      const scoreA = a.score?.totalScore ?? 0;
      const scoreB = b.score?.totalScore ?? 0;
      return scoreB - scoreA;
    });

    return sorted.map((bundle, index) => ({
      ...bundle,
      rank: index + 1
    }));
  }
};

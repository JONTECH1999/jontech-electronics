/**
 * Deterministic Factor Calculations for KitFlow Bundle Scoring Engine
 *
 * Factors:
 * 1. Sales Performance (Weight: 35%)
 * 2. Product Compatibility (Weight: 25%)
 * 3. Inventory Health (Weight: 20%)
 * 4. Discount Efficiency (Weight: 20%)
 */

import { BundleItemDto, ShopifyProductSummary } from '../../types';

export interface FactorWeights {
  salesWeight: number;        // default 0.35
  compatibilityWeight: number; // default 0.25
  inventoryWeight: number;    // default 0.20
  discountWeight: number;     // default 0.20
}

export const DEFAULT_WEIGHTS: FactorWeights = {
  salesWeight: 0.35,
  compatibilityWeight: 0.25,
  inventoryWeight: 0.20,
  discountWeight: 0.20
};

/**
 * 1. Sales Performance (0 - 100)
 * Evaluates historical co-order frequency, purchase velocity, and item popularity.
 */
export function calculateSalesScore(salesMetrics: { coOrderFrequency: number; totalOrdersEvaluated: number; combinedVelocity: number }): number {
  const { coOrderFrequency, totalOrdersEvaluated, combinedVelocity } = salesMetrics;

  if (totalOrdersEvaluated <= 0) {
    // Sensible baseline for newly launched bundles without historical data
    return 65;
  }

  // Ratio of orders containing co-purchased items
  const coOrderRatio = Math.min(1, coOrderFrequency / Math.max(1, totalOrdersEvaluated));
  // Normalized velocity score: 0 to 40
  const velocityFactor = Math.min(40, (combinedVelocity / Math.max(1, totalOrdersEvaluated)) * 100);

  // Score combines co-order affinity (60%) and item velocity (40%)
  const rawScore = (coOrderRatio * 150) * 0.6 + velocityFactor;
  return Math.min(100, Math.max(20, Math.round(rawScore)));
}

/**
 * 2. Product Compatibility (0 - 100)
 * Evaluates category synergy, functional complementarity, and vendor consistency.
 * Example: Mouse + Keyboard + Mousepad + Headset has near 100% synergy.
 * 4 duplicate mice in a bundle has very poor compatibility.
 */
export function calculateCompatibilityScore(items: BundleItemDto[], productsCatalog: ShopifyProductSummary[]): number {
  if (!items || items.length <= 1) {
    // Single item bundle has lower standalone bundle synergy
    return 50;
  }

  const distinctTypes = new Set<string>();
  const productTags = new Set<string>();

  for (const item of items) {
    const matched = productsCatalog.find(p => p.id === item.shopifyProductId);
    if (matched) {
      if (matched.productType) distinctTypes.add(matched.productType.toLowerCase());
      matched.tags.forEach(t => productTags.add(t.toLowerCase()));
    } else {
      // Fallback from title
      distinctTypes.add(item.productTitle.toLowerCase());
    }
  }

  // Diversity of complementary types: higher diversity across related categories is good
  const typeDiversityRatio = Math.min(1, distinctTypes.size / Math.max(1, items.length));

  // Category focus: Gaming, Work, Study, or Travel tags
  let synergyBonus = 0;
  if (productTags.has('gaming')) synergyBonus += 15;
  if (productTags.has('work') || productTags.has('productivity')) synergyBonus += 15;
  if (productTags.has('travel') || productTags.has('study')) synergyBonus += 15;

  // Base score depends on distinct complementary hardware items
  const baseScore = typeDiversityRatio >= 0.8 ? 85 : (typeDiversityRatio >= 0.5 ? 70 : 45);
  const totalCompat = Math.min(100, Math.max(30, baseScore + Math.min(15, synergyBonus)));

  return Math.round(totalCompat);
}

/**
 * 3. Inventory Health (0 - 100)
 * Protects merchant from promoting bundles with stockout risks.
 * - If lowest stock <= 2: Critical score (30 - 50)
 * - If lowest stock <= 5: Warning score (55 - 75)
 * - If all items > 10: Healthy score (90 - 100)
 */
export function calculateInventoryScore(lowestStock: number, criticalItemCount: number, stockHealthRatio: number): number {
  if (lowestStock <= 0) {
    // Complete stockout on at least 1 bundle component
    return 15;
  }

  if (lowestStock <= 2) {
    // Critical stock
    return Math.max(25, 45 - (criticalItemCount * 10));
  }

  if (lowestStock <= 5) {
    // Low stock warning
    return Math.max(50, 68 - (criticalItemCount * 8));
  }

  // Healthy stock: graded from 80 to 100 based on minimum stock and health ratio
  const stockScale = Math.min(20, Math.floor(lowestStock / 2));
  return Math.min(100, Math.round(80 + stockScale * (stockHealthRatio || 1)));
}

/**
 * 4. Discount Efficiency (0 - 100)
 * Evaluates whether the bundle discount motivates conversions without destroying merchant margin.
 * Optimal sweet spot for technology bundles: 10% to 20%.
 * - < 5%: Too low to motivate customers (50 - 65)
 * - 10% - 15%: Sweet spot, high efficiency (90 - 100)
 * - 16% - 25%: Good motivation, slight margin hit (80 - 90)
 * - > 35%: Excessively high, margin risk (50 - 60)
 */
export function calculateDiscountScore(discountPercent: number): number {
  const discount = Math.max(0, discountPercent);

  if (discount === 0) {
    return 50; // Zero incentive
  }
  if (discount > 0 && discount < 5) {
    return 65; // Minimal incentive
  }
  if (discount >= 5 && discount <= 8) {
    return 80;
  }
  if (discount > 8 && discount <= 15) {
    return 100; // Perfect merchant sweet spot
  }
  if (discount > 15 && discount <= 25) {
    return 88;
  }
  if (discount > 25 && discount <= 35) {
    return 72;
  }
  // Above 35% discount risks merchant profitability
  return Math.max(30, Math.round(72 - (discount - 35) * 1.5));
}

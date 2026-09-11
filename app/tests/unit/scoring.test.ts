import { describe, it, expect } from 'vitest';
import {
  calculateSalesScore,
  calculateCompatibilityScore,
  calculateInventoryScore,
  calculateDiscountScore,
  DEFAULT_WEIGHTS
} from '../../backend/src/services/scoring/score-factors';

describe('Deterministic Bundle Scoring Engine', () => {
  describe('Sales Performance Scoring', () => {
    it('calculates score for normal high-volume co-purchase data', () => {
      const score = calculateSalesScore({
        coOrderFrequency: 25,
        totalOrdersEvaluated: 100,
        combinedVelocity: 50
      });
      expect(score).toBeGreaterThanOrEqual(60);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('handles zero orders safely without division by zero', () => {
      const score = calculateSalesScore({
        coOrderFrequency: 0,
        totalOrdersEvaluated: 0,
        combinedVelocity: 0
      });
      expect(score).toBe(65); // baseline for new bundles
      expect(Number.isFinite(score)).toBe(true);
    });

    it('handles zero co-orders with positive total orders', () => {
      const score = calculateSalesScore({
        coOrderFrequency: 0,
        totalOrdersEvaluated: 50,
        combinedVelocity: 0
      });
      expect(score).toBe(20); // minimum floor
    });
  });

  describe('Product Compatibility Scoring', () => {
    it('awards high score for complementary electronics gear', () => {
      const items: any[] = [
        { shopifyProductId: 'p1', productTitle: 'Gaming Mouse' },
        { shopifyProductId: 'p2', productTitle: 'Mechanical Keyboard' },
        { shopifyProductId: 'p3', productTitle: 'Gaming Headset' },
        { shopifyProductId: 'p4', productTitle: 'Desk Mat' }
      ];
      const catalog: any[] = [
        { id: 'p1', productType: 'Mouse', tags: ['gaming'] },
        { id: 'p2', productType: 'Keyboard', tags: ['gaming'] },
        { id: 'p3', productType: 'Headset', tags: ['gaming'] },
        { id: 'p4', productType: 'Mat', tags: ['gaming'] }
      ];
      const score = calculateCompatibilityScore(items, catalog);
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('gives lower score for single-item or empty bundles', () => {
      expect(calculateCompatibilityScore([], [])).toBe(50);
      expect(calculateCompatibilityScore([{ shopifyProductId: 'p1', productTitle: 'Mouse' } as any], [])).toBe(50);
    });
  });

  describe('Inventory Health Scoring', () => {
    it('penalizes bundles with critical inventory (<= 2 units)', () => {
      const score = calculateInventoryScore(1, 1, 0.5);
      expect(score).toBeLessThanOrEqual(50);
    });

    it('scores high for abundant inventory across all items', () => {
      const score = calculateInventoryScore(35, 0, 1.0);
      expect(score).toBeGreaterThanOrEqual(95);
    });

    it('handles zero stockout gracefully', () => {
      const score = calculateInventoryScore(0, 1, 0);
      expect(score).toBe(15);
    });
  });

  describe('Discount Efficiency Scoring', () => {
    it('gives maximum score (100) for sweet spot discounts (8% - 15%)', () => {
      expect(calculateDiscountScore(10)).toBe(100);
      expect(calculateDiscountScore(12)).toBe(100);
      expect(calculateDiscountScore(15)).toBe(100);
    });

    it('penalizes 0% discount due to lack of buyer incentive', () => {
      expect(calculateDiscountScore(0)).toBe(50);
    });

    it('penalizes excessive discounts that hurt merchant margin (> 35%)', () => {
      const score45 = calculateDiscountScore(45);
      const score12 = calculateDiscountScore(12);
      expect(score45).toBeLessThan(score12);
    });
  });

  describe('Weight Distribution and Boundaries', () => {
    it('verifies that factor weights sum to exactly 1.0 (100%)', () => {
      const sum =
        DEFAULT_WEIGHTS.salesWeight +
        DEFAULT_WEIGHTS.compatibilityWeight +
        DEFAULT_WEIGHTS.inventoryWeight +
        DEFAULT_WEIGHTS.discountWeight;
      expect(sum).toBeCloseTo(1.0, 5);
    });
  });
});

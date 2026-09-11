import { describe, it, expect } from 'vitest';
import { bundleScoreService } from '../../backend/src/services/scoring/bundle-score.service';
import { BundleDto } from '../../backend/src/types';

describe('Bundle Ranking Engine', () => {
  const createMockBundle = (id: string, name: string, totalScore: number): BundleDto => ({
    id,
    shopId: 'shop_test',
    name,
    status: 'active',
    discountPercent: 10,
    targetCategory: 'Gaming',
    items: [],
    score: {
      salesScore: totalScore,
      compatibilityScore: totalScore,
      inventoryScore: totalScore,
      discountScore: totalScore,
      totalScore
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  it('ranks bundles in strict descending order of total score', () => {
    const b1 = createMockBundle('1', 'Mid Pack', 78);
    const b2 = createMockBundle('2', 'Top Pack', 94);
    const b3 = createMockBundle('3', 'Low Pack', 62);

    const ranked = bundleScoreService.rankBundles([b1, b2, b3]);

    expect(ranked).toHaveLength(3);
    expect(ranked[0].id).toBe('2');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].id).toBe('1');
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].id).toBe('3');
    expect(ranked[2].rank).toBe(3);
  });

  it('handles tied scores gracefully', () => {
    const b1 = createMockBundle('1', 'Bundle Alpha', 85);
    const b2 = createMockBundle('2', 'Bundle Beta', 85);

    const ranked = bundleScoreService.rankBundles([b1, b2]);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].score?.totalScore).toBe(85);
    expect(ranked[1].score?.totalScore).toBe(85);
  });

  it('returns empty array when no bundles are provided', () => {
    const ranked = bundleScoreService.rankBundles([]);
    expect(ranked).toEqual([]);
  });

  it('handles bundles with missing score objects (defaults to 0)', () => {
    const scored = createMockBundle('1', 'Scored', 80);
    const unscored: BundleDto = {
      ...createMockBundle('2', 'Unscored', 0),
      score: null
    };

    const ranked = bundleScoreService.rankBundles([unscored, scored]);
    expect(ranked[0].id).toBe('1');
    expect(ranked[1].id).toBe('2');
  });
});

import { describe, it, expect } from 'vitest';
import { createBundleSchema } from '../../backend/src/validators/bundle.validator';

describe('Bundle Input Validation Schema', () => {
  it('accepts a valid bundle configuration', () => {
    const valid = {
      name: 'JonTech Pro Workstation Setup',
      description: 'Complete dual screen setup',
      status: 'active',
      discountPercent: 12,
      targetCategory: 'Work',
      items: [
        {
          shopifyProductId: 'gid://shopify/Product/1',
          productTitle: 'Ergonomic Mouse',
          price: 2499,
          quantity: 1
        },
        {
          shopifyProductId: 'gid://shopify/Product/2',
          productTitle: 'Mechanical Keyboard',
          price: 3899,
          quantity: 1
        }
      ]
    };

    const parsed = createBundleSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects missing or empty bundle name', () => {
    const invalid = {
      name: '  ',
      discountPercent: 10,
      items: [{ shopifyProductId: 'p1', productTitle: 'Item 1', price: 100, quantity: 1 }]
    };
    const parsed = createBundleSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects bundles with zero items', () => {
    const invalid = {
      name: 'Empty Bundle',
      discountPercent: 10,
      items: []
    };
    const parsed = createBundleSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects item with invalid quantity (< 1)', () => {
    const invalid = {
      name: 'Bad Quantity Bundle',
      discountPercent: 10,
      items: [
        { shopifyProductId: 'p1', productTitle: 'Item', price: 100, quantity: 0 }
      ]
    };
    const parsed = createBundleSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects negative discount or excessive discount (> 75%)', () => {
    const negative = {
      name: 'Negative Discount',
      discountPercent: -5,
      items: [{ shopifyProductId: 'p1', productTitle: 'Item', price: 100, quantity: 1 }]
    };
    expect(createBundleSchema.safeParse(negative).success).toBe(false);

    const excessive = {
      name: 'Excessive Discount',
      discountPercent: 90,
      items: [{ shopifyProductId: 'p1', productTitle: 'Item', price: 100, quantity: 1 }]
    };
    expect(createBundleSchema.safeParse(excessive).success).toBe(false);
  });
});

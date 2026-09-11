import { describe, it, expect } from 'vitest';
import { shopifyInventoryService } from '../../backend/src/services/shopify/inventory.service';
import { ShopSession } from '../../backend/src/types';

describe('Deterministic Inventory Alert Logic', () => {
  const mockSession: ShopSession = {
    shopId: 'shop_test',
    shopifyDomain: 'test-store.myshopify.com',
    accessToken: 'test_token'
  };

  it('detects critical stock (<= 2 units) correctly', async () => {
    const items: any[] = [
      {
        shopifyProductId: 'gid://shopify/Product/903', // TitanSound in demo catalog has stock 3
        shopifyVariantId: 'gid://shopify/ProductVariant/9031',
        productTitle: 'TitanSound Headset'
      }
    ];

    const health = await shopifyInventoryService.evaluateBundleInventory(mockSession, items);
    expect(health.lowestStock).toBe(3);
    expect(health.warningItems).toHaveLength(1);
    expect(health.isAtRisk).toBe(true);
  });

  it('marks abundant stock as healthy without risk flags', async () => {
    const items: any[] = [
      {
        shopifyProductId: 'gid://shopify/Product/904', // AeroGlide has stock 42
        shopifyVariantId: 'gid://shopify/ProductVariant/9041',
        productTitle: 'AeroGlide Desk Mat'
      }
    ];

    const health = await shopifyInventoryService.evaluateBundleInventory(mockSession, items);
    expect(health.lowestStock).toBe(42);
    expect(health.criticalItems).toHaveLength(0);
    expect(health.warningItems).toHaveLength(0);
    expect(health.isAtRisk).toBe(false);
  });
});

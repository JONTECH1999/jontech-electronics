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
        shopifyProductId: 'gid://shopify/Product/107', // TFmini-S LiDAR in electronics catalog has stock 2
        shopifyVariantId: 'gid://shopify/ProductVariant/1071',
        productTitle: 'TFmini-S Micro Solid-State LiDAR Sensor'
      }
    ];

    const health = await shopifyInventoryService.evaluateBundleInventory(mockSession, items);
    expect(health.lowestStock).toBe(2);
    expect(health.criticalItems).toHaveLength(1);
    expect(health.isAtRisk).toBe(true);
  });

  it('marks abundant stock as healthy without risk flags', async () => {
    const items: any[] = [
      {
        shopifyProductId: 'gid://shopify/Product/106', // HC-SR04 Ultrasonic has stock 60
        shopifyVariantId: 'gid://shopify/ProductVariant/1061',
        productTitle: 'HC-SR04 Ultrasonic Distance Sensor'
      }
    ];

    const health = await shopifyInventoryService.evaluateBundleInventory(mockSession, items);
    expect(health.lowestStock).toBe(60);
    expect(health.criticalItems).toHaveLength(0);
    expect(health.warningItems).toHaveLength(0);
    expect(health.isAtRisk).toBe(false);
  });
});

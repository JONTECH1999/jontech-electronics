import { describe, it, expect } from 'vitest';
import { dbRepository } from '../../backend/src/db';

describe('Multi-Tenant Data Isolation (Shop Scoping)', () => {
  it('ensures Shop A cannot access bundles created by Shop B', async () => {
    // 0. Provision tenant shops to satisfy database foreign keys
    const shopA = await dbRepository.upsertShop({
      shopifyDomain: 'tenant-a-isolation.myshopify.com',
      accessToken: 'token_tenant_a'
    });
    const shopB = await dbRepository.upsertShop({
      shopifyDomain: 'tenant-b-isolation.myshopify.com',
      accessToken: 'token_tenant_b'
    });
    const shopAId = shopA.id;
    const shopBId = shopB.id;

    // 1. Create a bundle belonging exclusively to Shop B
    const bundleB = await dbRepository.createBundle(shopBId, {
      name: 'Shop B Exclusive Gaming Bundle',
      description: 'Private bundle for Shop B',
      status: 'active',
      discountPercent: 15,
      targetCategory: 'Gaming',
      items: [
        {
          shopifyProductId: 'gid://shopify/Product/B1',
          productTitle: 'Shop B Custom Mouse',
          price: 1500,
          quantity: 1
        }
      ]
    });

    // 2. Query bundles using Shop A context
    const shopABundles = await dbRepository.getBundlesByShop(shopAId);
    const leaked = shopABundles.find(b => b.id === bundleB.id);
    expect(leaked).toBeUndefined();

    // 3. Attempt direct fetch of Shop B bundle using Shop A context
    const directAccessByA = await dbRepository.getBundleById(bundleB.id, shopAId);
    expect(directAccessByA).toBeNull();

    // 4. Verify Shop B can access its own bundle
    const directAccessByB = await dbRepository.getBundleById(bundleB.id, shopBId);
    expect(directAccessByB).not.toBeNull();
    expect(directAccessByB?.name).toBe('Shop B Exclusive Gaming Bundle');

    // 5. Attempt update from Shop A on Shop B's bundle (must fail)
    const unauthorizedUpdate = await dbRepository.updateBundle(bundleB.id, shopAId, {
      name: 'Hacked by Shop A'
    });
    expect(unauthorizedUpdate).toBeNull();

    // 6. Attempt delete from Shop A on Shop B's bundle (must fail)
    const unauthorizedDelete = await dbRepository.deleteBundle(bundleB.id, shopAId);
    expect(unauthorizedDelete).toBe(false);

    // Verify bundle still exists unharmed for Shop B
    const intactBundle = await dbRepository.getBundleById(bundleB.id, shopBId);
    expect(intactBundle).not.toBeNull();
  });
});

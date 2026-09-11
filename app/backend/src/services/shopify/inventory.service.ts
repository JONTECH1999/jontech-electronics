import { ShopSession, BundleItemDto } from '../../types';
import { shopifyProductsService } from './products.service';

export interface BundleInventoryHealth {
  lowestStock: number;
  criticalItems: Array<{ productTitle: string; stock: number }>;
  warningItems: Array<{ productTitle: string; stock: number }>;
  stockHealthRatio: number; // 0 to 1
  isAtRisk: boolean;
}

export const shopifyInventoryService = {
  async evaluateBundleInventory(session: ShopSession, items: BundleItemDto[]): Promise<BundleInventoryHealth> {
    const products = await shopifyProductsService.getProducts(session);

    let lowestStock = Infinity;
    const criticalItems: Array<{ productTitle: string; stock: number }> = [];
    const warningItems: Array<{ productTitle: string; stock: number }> = [];
    let healthyCount = 0;

    for (const item of items) {
      const product = products.find(p => p.id === item.shopifyProductId);
      let stock = 15; // default fallback

      if (product) {
        if (item.shopifyVariantId) {
          const variant = product.variants.find(v => v.id === item.shopifyVariantId);
          if (variant) stock = variant.inventoryQuantity;
        } else if (product.variants.length > 0) {
          stock = product.variants[0].inventoryQuantity;
        }
      }

      if (stock < lowestStock) {
        lowestStock = stock;
      }

      if (stock <= 2) {
        criticalItems.push({ productTitle: item.productTitle, stock });
      } else if (stock <= 5) {
        warningItems.push({ productTitle: item.productTitle, stock });
      } else {
        healthyCount++;
      }
    }

    if (lowestStock === Infinity) {
      lowestStock = 0;
    }

    const totalItems = Math.max(1, items.length);
    const stockHealthRatio = Math.min(1, Math.max(0, healthyCount / totalItems));

    return {
      lowestStock,
      criticalItems,
      warningItems,
      stockHealthRatio,
      isAtRisk: criticalItems.length > 0 || warningItems.length > 0
    };
  }
};

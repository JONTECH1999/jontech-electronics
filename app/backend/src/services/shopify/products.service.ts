import { ShopifyGraphQLClient } from './client';
import { ShopSession, ShopifyProductSummary } from '../../types';
import { env } from '../../config/env';

// Realistic JonTech Electronics catalog for development mode and fallback
export const DEMO_PRODUCTS: ShopifyProductSummary[] = [
  {
    id: 'gid://shopify/Product/901',
    title: 'ApexPro 8K Optical Gaming Mouse',
    vendor: 'JonTech Gaming',
    productType: 'Gaming Mouse',
    tags: ['Gaming', 'Peripherals', 'High-DPI', 'Esports'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9011',
        title: 'Midnight Black',
        price: 1899.00,
        compareAtPrice: 2199.00,
        inventoryQuantity: 24,
        sku: 'JT-APEX-8K-BLK'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/902',
    title: 'Vortex K75 Mechanical Keyboard',
    vendor: 'JonTech Gaming',
    productType: 'Mechanical Keyboard',
    tags: ['Gaming', 'Peripherals', 'Mechanical', 'RGB'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9021',
        title: 'Linear Red Switches',
        price: 2199.00,
        compareAtPrice: 2599.00,
        inventoryQuantity: 18,
        sku: 'JT-VRTX-K75-RED'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/903',
    title: 'TitanSound 7.1 Spatial Audio Headset',
    vendor: 'JonTech Audio',
    productType: 'Gaming Headset',
    tags: ['Gaming', 'Audio', 'Surround Sound'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9031',
        title: 'Standard Edition',
        price: 2499.00,
        compareAtPrice: 2899.00,
        inventoryQuantity: 3, // Low inventory to demonstrate alerts
        sku: 'JT-TTN-71-BLK'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/904',
    title: 'AeroGlide Pro Gaming Desk Mat (900x400)',
    vendor: 'JonTech Accessories',
    productType: 'Desk Mat',
    tags: ['Gaming', 'Accessories', 'Desk Mat'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9041',
        title: 'Stealth Grey',
        price: 799.00,
        compareAtPrice: 999.00,
        inventoryQuantity: 42,
        sku: 'JT-AERO-9040'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/905',
    title: 'MasterCraft MX Multi-Device Flow Mouse',
    vendor: 'JonTech Studio',
    productType: 'Office Mouse',
    tags: ['Work', 'Productivity', 'Ergonomic', 'Bluetooth'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9051',
        title: 'Graphite',
        price: 3499.00,
        compareAtPrice: 3899.00,
        inventoryQuantity: 15,
        sku: 'JT-MC-MX-GRF'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/906',
    title: 'NovaType Split Ergonomic Mechanical Keyboard',
    vendor: 'JonTech Studio',
    productType: 'Ergonomic Keyboard',
    tags: ['Work', 'Productivity', 'Ergonomic', 'Mechanical'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9061',
        title: 'Silent Brown Switches',
        price: 4299.00,
        compareAtPrice: 4799.00,
        inventoryQuantity: 11,
        sku: 'JT-NV-SPLIT-BRN'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/907',
    title: 'ClearVoice AI Noise-Cancelling Headset',
    vendor: 'JonTech Audio',
    productType: 'Conference Audio',
    tags: ['Work', 'Audio', 'Noise-Cancelling'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9071',
        title: 'USB-C / Wireless',
        price: 2499.00,
        compareAtPrice: 2799.00,
        inventoryQuantity: 28,
        sku: 'JT-CV-ANC-USB'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/908',
    title: 'AnywhereGo Multi-Surface Bluetooth Mouse',
    vendor: 'JonTech Mobility',
    productType: 'Travel Mouse',
    tags: ['Travel', 'Study', 'Compact', 'Bluetooth'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9081',
        title: 'Pocket Edition',
        price: 1699.00,
        compareAtPrice: 1999.00,
        inventoryQuantity: 35,
        sku: 'JT-AWG-BT-MINI'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/909',
    title: 'TravelPro Folding Bluetooth Keyboard',
    vendor: 'JonTech Mobility',
    productType: 'Folding Keyboard',
    tags: ['Travel', 'Study', 'Portable', 'Bluetooth'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9091',
        title: 'Magnetic Tri-Fold',
        price: 2199.00,
        compareAtPrice: 2499.00,
        inventoryQuantity: 19,
        sku: 'JT-TRV-FOLD-TRI'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/910',
    title: 'PocketGaN 65W Foldable Travel Adapter',
    vendor: 'JonTech Power',
    productType: 'Charger',
    tags: ['Travel', 'Accessories', 'Fast-Charge', 'GaN'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/9101',
        title: 'Universal Multi-Port',
        price: 1499.00,
        compareAtPrice: 1799.00,
        inventoryQuantity: 40,
        sku: 'JT-GAN-65W-UNIV'
      }
    ]
  }
];

export interface ProductQueryResult {
  products: ShopifyProductSummary[];
  isDemoData: boolean;
  apiVersion: string;
}

export const shopifyProductsService = {
  async getProductsWithMetadata(session: ShopSession): Promise<ProductQueryResult> {
    if (env.USE_DEMO_DATA) {
      return {
        products: DEMO_PRODUCTS,
        isDemoData: true,
        apiVersion: env.SHOPIFY_API_VERSION
      };
    }

    const client = new ShopifyGraphQLClient(session.shopifyDomain, session.accessToken);

    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              vendor
              productType
              tags
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    inventoryQuantity
                    sku
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await client.query(query, { first: 50 });
      if (response.data?.products?.edges?.length > 0) {
        const products = response.data.products.edges.map((edge: any) => {
          const p = edge.node;
          return {
            id: p.id,
            title: p.title,
            vendor: p.vendor,
            productType: p.productType,
            tags: p.tags,
            variants: p.variants.edges.map((v: any) => ({
              id: v.node.id,
              title: v.node.title,
              price: parseFloat(v.node.price || 0),
              compareAtPrice: v.node.compareAtPrice ? parseFloat(v.node.compareAtPrice) : undefined,
              inventoryQuantity: v.node.inventoryQuantity ?? 10,
              sku: v.node.sku || ''
            }))
          };
        });

        return {
          products,
          isDemoData: false,
          apiVersion: env.SHOPIFY_API_VERSION
        };
      }
    } catch (e: any) {
      console.warn('Shopify live product query fallback to local demo catalog:', e.message);
    }

    // Default to demo catalog
    return {
      products: DEMO_PRODUCTS,
      isDemoData: true,
      apiVersion: env.SHOPIFY_API_VERSION
    };
  },

  async getProducts(session: ShopSession): Promise<ShopifyProductSummary[]> {
    const result = await this.getProductsWithMetadata(session);
    return result.products;
  },

  async getProductById(session: ShopSession, productId: string): Promise<ShopifyProductSummary | null> {
    const all = await this.getProducts(session);
    return all.find(p => p.id === productId) || null;
  }
};

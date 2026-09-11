import { getDb } from './connection';
import { env } from '../config/env';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from './schema';
import { BundleDto, ScoreFactors, AiBundleAnalysisResult, AlertDto, ActivityLogDto } from '../types';

// In-memory fallback data store for offline demo mode or testing
class MemoryStore {
  shops: Array<any> = [
    {
      id: 'shop_demo_01',
      shopifyDomain: env.DEMO_SHOP_DOMAIN,
      shopifyStoreId: 'gid://shopify/Shop/82910291',
      accessToken: 'shpat_demo_access_token_kitflow_secure',
      scope: env.SHOPIFY_SCOPES,
      isActive: true,
      createdAt: new Date('2026-09-01T08:00:00Z'),
      updatedAt: new Date('2026-09-01T08:00:00Z')
    }
  ];

  bundles: Array<any> = [
    {
      id: 'bundle_gaming_01',
      shopId: 'shop_demo_01',
      name: 'Gaming Battlestation Starter Pack',
      description: 'Competitive esports setup calibrated for fast-paced shooters with 8K polling and mechanical switches.',
      status: 'active',
      discountPercent: '12.00',
      targetCategory: 'Gaming',
      createdAt: new Date('2026-09-02T10:00:00Z'),
      updatedAt: new Date('2026-09-10T14:30:00Z')
    },
    {
      id: 'bundle_work_02',
      shopId: 'shop_demo_01',
      name: 'Work From Home Ergonomic Studio',
      description: 'Orthopedic workstation suite designed for programmers and creators working 8+ hour screen sessions.',
      status: 'active',
      discountPercent: '14.00',
      targetCategory: 'Work',
      createdAt: new Date('2026-09-03T11:00:00Z'),
      updatedAt: new Date('2026-09-11T09:15:00Z')
    },
    {
      id: 'bundle_travel_03',
      shopId: 'shop_demo_01',
      name: 'Nomad Road Warrior Travel Tech Kit',
      description: 'Ultra-lightweight peripherals and 65W GaN charging engineered for airport lounges and coffee shop sprints.',
      status: 'active',
      discountPercent: '10.00',
      targetCategory: 'Travel',
      createdAt: new Date('2026-09-05T13:45:00Z'),
      updatedAt: new Date('2026-09-09T16:20:00Z')
    }
  ];

  bundleItems: Array<any> = [
    // Bundle 1 items
    {
      id: 'item_1_1',
      bundleId: 'bundle_gaming_01',
      shopifyProductId: 'gid://shopify/Product/901',
      shopifyVariantId: 'gid://shopify/ProductVariant/9011',
      productTitle: 'ApexPro 8K Optical Gaming Mouse',
      variantTitle: 'Midnight Black',
      price: '1899.00',
      quantity: 1,
      createdAt: new Date('2026-09-02T10:00:00Z')
    },
    {
      id: 'item_1_2',
      bundleId: 'bundle_gaming_01',
      shopifyProductId: 'gid://shopify/Product/902',
      shopifyVariantId: 'gid://shopify/ProductVariant/9021',
      productTitle: 'Vortex K75 Mechanical Keyboard',
      variantTitle: 'Linear Red Switches',
      price: '2199.00',
      quantity: 1,
      createdAt: new Date('2026-09-02T10:00:00Z')
    },
    {
      id: 'item_1_3',
      bundleId: 'bundle_gaming_01',
      shopifyProductId: 'gid://shopify/Product/903',
      shopifyVariantId: 'gid://shopify/ProductVariant/9031',
      productTitle: 'TitanSound 7.1 Spatial Audio Headset',
      variantTitle: 'Standard Edition',
      price: '2499.00',
      quantity: 1,
      createdAt: new Date('2026-09-02T10:00:00Z')
    },
    {
      id: 'item_1_4',
      bundleId: 'bundle_gaming_01',
      shopifyProductId: 'gid://shopify/Product/904',
      shopifyVariantId: 'gid://shopify/ProductVariant/9041',
      productTitle: 'AeroGlide Pro Gaming Desk Mat (900x400)',
      variantTitle: 'Stealth Grey',
      price: '799.00',
      quantity: 1,
      createdAt: new Date('2026-09-02T10:00:00Z')
    },

    // Bundle 2 items
    {
      id: 'item_2_1',
      bundleId: 'bundle_work_02',
      shopifyProductId: 'gid://shopify/Product/905',
      shopifyVariantId: 'gid://shopify/ProductVariant/9051',
      productTitle: 'MasterCraft MX Multi-Device Flow Mouse',
      variantTitle: 'Graphite',
      price: '3499.00',
      quantity: 1,
      createdAt: new Date('2026-09-03T11:00:00Z')
    },
    {
      id: 'item_2_2',
      bundleId: 'bundle_work_02',
      shopifyProductId: 'gid://shopify/Product/906',
      shopifyVariantId: 'gid://shopify/ProductVariant/9061',
      productTitle: 'NovaType Split Ergonomic Mechanical Keyboard',
      variantTitle: 'Silent Brown Switches',
      price: '4299.00',
      quantity: 1,
      createdAt: new Date('2026-09-03T11:00:00Z')
    },
    {
      id: 'item_2_3',
      bundleId: 'bundle_work_02',
      shopifyProductId: 'gid://shopify/Product/907',
      shopifyVariantId: 'gid://shopify/ProductVariant/9071',
      productTitle: 'ClearVoice AI Noise-Cancelling Headset',
      variantTitle: 'USB-C / Wireless',
      price: '2499.00',
      quantity: 1,
      createdAt: new Date('2026-09-03T11:00:00Z')
    },

    // Bundle 3 items
    {
      id: 'item_3_1',
      bundleId: 'bundle_travel_03',
      shopifyProductId: 'gid://shopify/Product/908',
      shopifyVariantId: 'gid://shopify/ProductVariant/9081',
      productTitle: 'AnywhereGo Multi-Surface Bluetooth Mouse',
      variantTitle: 'Pocket Edition',
      price: '1699.00',
      quantity: 1,
      createdAt: new Date('2026-09-05T13:45:00Z')
    },
    {
      id: 'item_3_2',
      bundleId: 'bundle_travel_03',
      shopifyProductId: 'gid://shopify/Product/909',
      shopifyVariantId: 'gid://shopify/ProductVariant/9091',
      productTitle: 'TravelPro Folding Bluetooth Keyboard',
      variantTitle: 'Magnetic Tri-Fold',
      price: '2199.00',
      quantity: 1,
      createdAt: new Date('2026-09-05T13:45:00Z')
    },
    {
      id: 'item_3_3',
      bundleId: 'bundle_travel_03',
      shopifyProductId: 'gid://shopify/Product/910',
      shopifyVariantId: 'gid://shopify/ProductVariant/9101',
      productTitle: 'PocketGaN 65W Foldable Travel Adapter',
      variantTitle: 'Universal Multi-Port',
      price: '1499.00',
      quantity: 1,
      createdAt: new Date('2026-09-05T13:45:00Z')
    }
  ];

  bundleScores: Array<any> = [
    {
      id: 'score_1',
      bundleId: 'bundle_gaming_01',
      salesScore: '94.00',
      compatibilityScore: '96.00',
      inventoryScore: '68.00',
      discountScore: '90.00',
      totalScore: '88.50',
      scoreVersion: 'v1.0',
      metricsSnapshot: {
        lowestStock: 3,
        criticalItemCount: 1,
        coOrderFrequency: 18,
        discountPercent: 12
      },
      createdAt: new Date('2026-09-10T14:30:00Z'),
      updatedAt: new Date('2026-09-10T14:30:00Z')
    },
    {
      id: 'score_2',
      bundleId: 'bundle_work_02',
      salesScore: '88.00',
      compatibilityScore: '95.00',
      inventoryScore: '92.00',
      discountScore: '86.00',
      totalScore: '90.15',
      scoreVersion: 'v1.0',
      metricsSnapshot: {
        lowestStock: 14,
        criticalItemCount: 0,
        coOrderFrequency: 12,
        discountPercent: 14
      },
      createdAt: new Date('2026-09-11T09:15:00Z'),
      updatedAt: new Date('2026-09-11T09:15:00Z')
    },
    {
      id: 'score_3',
      bundleId: 'bundle_travel_03',
      salesScore: '72.00',
      compatibilityScore: '88.00',
      inventoryScore: '85.00',
      discountScore: '82.00',
      totalScore: '80.60',
      scoreVersion: 'v1.0',
      metricsSnapshot: {
        lowestStock: 18,
        criticalItemCount: 0,
        coOrderFrequency: 7,
        discountPercent: 10
      },
      createdAt: new Date('2026-09-09T16:20:00Z'),
      updatedAt: new Date('2026-09-09T16:20:00Z')
    }
  ];

  aiAnalyses: Array<any> = [
    {
      id: 'ai_analysis_1',
      bundleId: 'bundle_gaming_01',
      model: 'claude-3-5-sonnet-20241022',
      summary: 'The Gaming Battlestation Starter Pack is a top revenue-generating setup with stellar synergy (96% compatibility) and proven co-purchase validation. However, the TitanSound Headset currently faces critical stock exhaustion.',
      strengths: [
        'High customer affinity: Mouse and mechanical keyboard are frequently purchased together in 68% of single checkout events.',
        'Balanced price point under ₱10,000 gives strong perceived value against individual MSRP.',
        'High conversion rate among first-time storefront visitors.'
      ],
      risks: [
        'Inventory Risk: TitanSound 7.1 Gaming Headset only has 3 units left in warehouse stock.',
        'A stockout on the headset will temporarily disqualify the bundle from instant fulfillment.'
      ],
      recommendations: [
        'Prioritize an immediate warehouse reorder of at least 25 units for TitanSound 7.1 Headset.',
        'Consider offering the AeroGlide Desk Mat as an optional bundle add-on at 15% discount to lift AOV further.'
      ],
      rawResponse: null,
      createdAt: new Date('2026-09-10T14:32:00Z')
    }
  ];

  activityLogs: Array<any> = [
    {
      id: 'act_1',
      shopId: 'shop_demo_01',
      bundleId: 'bundle_gaming_01',
      action: 'bundle_created',
      description: 'Merchant created "Gaming Battlestation Starter Pack" with 4 initial items.',
      metadata: { itemCount: 4, discountPercent: 12 },
      createdAt: new Date('2026-09-02T10:00:00Z')
    },
    {
      id: 'act_2',
      shopId: 'shop_demo_01',
      bundleId: 'bundle_gaming_01',
      action: 'score_recalculated',
      description: 'Deterministic bundle score updated to 88.50/100.',
      metadata: { previousScore: 84.0, newScore: 88.5 },
      createdAt: new Date('2026-09-10T14:30:00Z')
    },
    {
      id: 'act_3',
      shopId: 'shop_demo_01',
      bundleId: 'bundle_gaming_01',
      action: 'ai_analysis_generated',
      description: 'AI Bundle Analyst generated strategic recommendations via Claude 3.5 Sonnet.',
      metadata: { model: 'claude-3-5-sonnet-20241022' },
      createdAt: new Date('2026-09-10T14:32:00Z')
    },
    {
      id: 'act_4',
      shopId: 'shop_demo_01',
      bundleId: 'bundle_gaming_01',
      action: 'inventory_alert_triggered',
      description: 'Inventory alert triggered: TitanSound Headset stock fell to 3 units.',
      metadata: { severity: 'warning', stock: 3 },
      createdAt: new Date('2026-09-10T14:35:00Z')
    },
    {
      id: 'act_5',
      shopId: 'shop_demo_01',
      bundleId: 'bundle_work_02',
      action: 'bundle_created',
      description: 'Merchant created "Work From Home Ergonomic Studio" with 3 curated items.',
      metadata: { itemCount: 3, discountPercent: 14 },
      createdAt: new Date('2026-09-03T11:00:00Z')
    }
  ];

  alerts: Array<any> = [
    {
      id: 'alert_1',
      shopId: 'shop_demo_01',
      bundleId: 'bundle_gaming_01',
      type: 'inventory_warning',
      severity: 'warning',
      title: 'Low Inventory on Included Item',
      message: 'TitanSound 7.1 Gaming Headset has only 3 units remaining. Bundle fulfillment will be blocked if stock reaches zero.',
      status: 'active',
      createdAt: new Date('2026-09-10T14:35:00Z'),
      resolvedAt: null
    }
  ];
}

const memoryStore = new MemoryStore();

// Repository implementation that switches seamlessly between MySQL via Drizzle and MemoryStore
export const dbRepository = {
  // Shops
  async getShopByDomain(domain: string) {
    const { db, isConnectedToMysql } = await getDb();
    if (isConnectedToMysql && db) {
      const results = await db.select().from(schema.shops).where(eq(schema.shops.shopifyDomain, domain));
      return results[0] || null;
    }
    return memoryStore.shops.find(s => s.shopifyDomain === domain) || null;
  },

  async getShopById(id: string) {
    const { db, isConnectedToMysql } = await getDb();
    if (isConnectedToMysql && db) {
      const results = await db.select().from(schema.shops).where(eq(schema.shops.id, id));
      return results[0] || null;
    }
    return memoryStore.shops.find(s => s.id === id) || null;
  },

  async upsertShop(data: { shopifyDomain: string; accessToken: string; scope?: string; shopifyStoreId?: string }) {
    const { db, isConnectedToMysql } = await getDb();
    const existing = await this.getShopByDomain(data.shopifyDomain);

    if (isConnectedToMysql && db) {
      if (existing) {
        await db.update(schema.shops).set({
          accessToken: data.accessToken,
          scope: data.scope,
          shopifyStoreId: data.shopifyStoreId,
          isActive: true,
          updatedAt: new Date()
        }).where(eq(schema.shops.id, existing.id));
        return { ...existing, ...data };
      } else {
        const id = 'shop_' + Math.random().toString(36).substring(2, 10);
        const newShop = {
          id,
          shopifyDomain: data.shopifyDomain,
          accessToken: data.accessToken,
          scope: data.scope || null,
          shopifyStoreId: data.shopifyStoreId || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await db.insert(schema.shops).values(newShop);
        return newShop;
      }
    }

    if (existing) {
      existing.accessToken = data.accessToken;
      existing.scope = data.scope;
      existing.shopifyStoreId = data.shopifyStoreId;
      existing.updatedAt = new Date();
      return existing;
    } else {
      const newShop = {
        id: 'shop_' + Math.random().toString(36).substring(2, 10),
        ...data,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.shops.push(newShop);
      return newShop;
    }
  },

  // Bundles (Strictly Shop Isolated)
  async getBundlesByShop(shopId: string): Promise<BundleDto[]> {
    const { db, isConnectedToMysql } = await getDb();
    let rawBundles: any[] = [];

    if (isConnectedToMysql && db) {
      rawBundles = await db.select().from(schema.bundles).where(eq(schema.bundles.shopId, shopId)).orderBy(desc(schema.bundles.createdAt));
    } else {
      rawBundles = memoryStore.bundles.filter(b => b.shopId === shopId);
    }

    const dtos: BundleDto[] = [];
    for (const b of rawBundles) {
      const fullBundle = await this.getBundleById(b.id, shopId);
      if (fullBundle) dtos.push(fullBundle);
    }

    return dtos;
  },

  async getBundleById(id: string, shopId: string): Promise<BundleDto | null> {
    const { db, isConnectedToMysql } = await getDb();
    let bundleRecord: any = null;

    if (isConnectedToMysql && db) {
      const results = await db.select().from(schema.bundles)
        .where(and(eq(schema.bundles.id, id), eq(schema.bundles.shopId, shopId)));
      bundleRecord = results[0] || null;
    } else {
      bundleRecord = memoryStore.bundles.find(b => b.id === id && b.shopId === shopId) || null;
    }

    if (!bundleRecord) return null;

    // Fetch items
    let items: any[] = [];
    if (isConnectedToMysql && db) {
      items = await db.select().from(schema.bundleItems).where(eq(schema.bundleItems.bundleId, id));
    } else {
      items = memoryStore.bundleItems.filter(i => i.bundleId === id);
    }

    // Fetch scores
    let score: any = null;
    if (isConnectedToMysql && db) {
      const scoreRows = await db.select().from(schema.bundleScores).where(eq(schema.bundleScores.bundleId, id));
      score = scoreRows[0] || null;
    } else {
      score = memoryStore.bundleScores.find(s => s.bundleId === id) || null;
    }

    // Fetch latest AI analysis
    let latestAnalysis: any = null;
    if (isConnectedToMysql && db) {
      const aiRows = await db.select().from(schema.aiAnalyses).where(eq(schema.aiAnalyses.bundleId, id)).orderBy(desc(schema.aiAnalyses.createdAt));
      latestAnalysis = aiRows[0] || null;
    } else {
      latestAnalysis = memoryStore.aiAnalyses.filter(a => a.bundleId === id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null;
    }

    // Active alert count
    const alerts = await this.getAlertsByBundle(id, shopId);
    const activeAlertCount = alerts.filter(a => a.status === 'active').length;

    return {
      id: bundleRecord.id,
      shopId: bundleRecord.shopId,
      name: bundleRecord.name,
      description: bundleRecord.description,
      status: bundleRecord.status,
      discountPercent: parseFloat(bundleRecord.discountPercent || 0),
      targetCategory: bundleRecord.targetCategory || 'General',
      items: items.map(i => ({
        id: i.id,
        shopifyProductId: i.shopifyProductId,
        shopifyVariantId: i.shopifyVariantId,
        productTitle: i.productTitle,
        variantTitle: i.variantTitle,
        price: parseFloat(i.price || 0),
        quantity: i.quantity
      })),
      score: score ? {
        salesScore: parseFloat(score.salesScore || 0),
        compatibilityScore: parseFloat(score.compatibilityScore || 0),
        inventoryScore: parseFloat(score.inventoryScore || 0),
        discountScore: parseFloat(score.discountScore || 0),
        totalScore: parseFloat(score.totalScore || 0)
      } : null,
      latestAnalysis: latestAnalysis ? {
        summary: latestAnalysis.summary,
        strengths: typeof latestAnalysis.strengths === 'string' ? JSON.parse(latestAnalysis.strengths) : latestAnalysis.strengths,
        risks: typeof latestAnalysis.risks === 'string' ? JSON.parse(latestAnalysis.risks) : latestAnalysis.risks,
        recommendations: typeof latestAnalysis.recommendations === 'string' ? JSON.parse(latestAnalysis.recommendations) : latestAnalysis.recommendations,
        model: latestAnalysis.model,
        generatedAt: latestAnalysis.createdAt?.toISOString()
      } : null,
      activeAlertCount,
      createdAt: bundleRecord.createdAt?.toISOString?.() || new Date(bundleRecord.createdAt).toISOString(),
      updatedAt: bundleRecord.updatedAt?.toISOString?.() || new Date(bundleRecord.updatedAt).toISOString()
    };
  },

  async createBundle(shopId: string, data: {
    name: string;
    description?: string;
    status?: 'active' | 'draft' | 'archived';
    discountPercent: number;
    targetCategory?: string;
    items: Array<{
      shopifyProductId: string;
      shopifyVariantId?: string;
      productTitle: string;
      variantTitle?: string;
      price: number;
      quantity: number;
    }>;
  }): Promise<BundleDto> {
    const bundleId = 'bundle_' + Math.random().toString(36).substring(2, 11);
    const { db, isConnectedToMysql } = await getDb();

    const newBundle = {
      id: bundleId,
      shopId,
      name: data.name,
      description: data.description || null,
      status: data.status || 'draft',
      discountPercent: (data.discountPercent || 0).toFixed(2),
      targetCategory: data.targetCategory || 'General',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isConnectedToMysql && db) {
      await db.insert(schema.bundles).values(newBundle);
      for (const item of data.items) {
        await db.insert(schema.bundleItems).values({
          id: 'item_' + Math.random().toString(36).substring(2, 11),
          bundleId,
          shopifyProductId: item.shopifyProductId,
          shopifyVariantId: item.shopifyVariantId || null,
          productTitle: item.productTitle,
          variantTitle: item.variantTitle || null,
          price: (item.price || 0).toFixed(2),
          quantity: item.quantity || 1,
          createdAt: new Date()
        });
      }
    } else {
      memoryStore.bundles.push(newBundle);
      for (const item of data.items) {
        memoryStore.bundleItems.push({
          id: 'item_' + Math.random().toString(36).substring(2, 11),
          bundleId,
          shopifyProductId: item.shopifyProductId,
          shopifyVariantId: item.shopifyVariantId || null,
          productTitle: item.productTitle,
          variantTitle: item.variantTitle || null,
          price: (item.price || 0).toFixed(2),
          quantity: item.quantity || 1,
          createdAt: new Date()
        });
      }
    }

    return (await this.getBundleById(bundleId, shopId))!;
  },

  async updateBundle(id: string, shopId: string, data: {
    name?: string;
    description?: string;
    status?: 'active' | 'draft' | 'archived';
    discountPercent?: number;
    targetCategory?: string;
    items?: Array<{
      shopifyProductId: string;
      shopifyVariantId?: string;
      productTitle: string;
      variantTitle?: string;
      price: number;
      quantity: number;
    }>;
  }): Promise<BundleDto | null> {
    const existing = await this.getBundleById(id, shopId);
    if (!existing) return null;

    const { db, isConnectedToMysql } = await getDb();

    if (isConnectedToMysql && db) {
      const updatePayload: any = { updatedAt: new Date() };
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.description !== undefined) updatePayload.description = data.description;
      if (data.status !== undefined) updatePayload.status = data.status;
      if (data.discountPercent !== undefined) updatePayload.discountPercent = data.discountPercent.toFixed(2);
      if (data.targetCategory !== undefined) updatePayload.targetCategory = data.targetCategory;

      await db.update(schema.bundles).set(updatePayload)
        .where(and(eq(schema.bundles.id, id), eq(schema.bundles.shopId, shopId)));

      if (data.items) {
        await db.delete(schema.bundleItems).where(eq(schema.bundleItems.bundleId, id));
        for (const item of data.items) {
          await db.insert(schema.bundleItems).values({
            id: 'item_' + Math.random().toString(36).substring(2, 11),
            bundleId: id,
            shopifyProductId: item.shopifyProductId,
            shopifyVariantId: item.shopifyVariantId || null,
            productTitle: item.productTitle,
            variantTitle: item.variantTitle || null,
            price: (item.price || 0).toFixed(2),
            quantity: item.quantity || 1,
            createdAt: new Date()
          });
        }
      }
    } else {
      const bIndex = memoryStore.bundles.findIndex(b => b.id === id && b.shopId === shopId);
      if (bIndex >= 0) {
        if (data.name !== undefined) memoryStore.bundles[bIndex].name = data.name;
        if (data.description !== undefined) memoryStore.bundles[bIndex].description = data.description;
        if (data.status !== undefined) memoryStore.bundles[bIndex].status = data.status;
        if (data.discountPercent !== undefined) memoryStore.bundles[bIndex].discountPercent = data.discountPercent.toFixed(2);
        if (data.targetCategory !== undefined) memoryStore.bundles[bIndex].targetCategory = data.targetCategory;
        memoryStore.bundles[bIndex].updatedAt = new Date();
      }

      if (data.items) {
        memoryStore.bundleItems = memoryStore.bundleItems.filter(i => i.bundleId !== id);
        for (const item of data.items) {
          memoryStore.bundleItems.push({
            id: 'item_' + Math.random().toString(36).substring(2, 11),
            bundleId: id,
            shopifyProductId: item.shopifyProductId,
            shopifyVariantId: item.shopifyVariantId || null,
            productTitle: item.productTitle,
            variantTitle: item.variantTitle || null,
            price: (item.price || 0).toFixed(2),
            quantity: item.quantity || 1,
            createdAt: new Date()
          });
        }
      }
    }

    return await this.getBundleById(id, shopId);
  },

  async deleteBundle(id: string, shopId: string): Promise<boolean> {
    const existing = await this.getBundleById(id, shopId);
    if (!existing) return false;

    const { db, isConnectedToMysql } = await getDb();
    if (isConnectedToMysql && db) {
      await db.delete(schema.bundles).where(and(eq(schema.bundles.id, id), eq(schema.bundles.shopId, shopId)));
    } else {
      memoryStore.bundles = memoryStore.bundles.filter(b => !(b.id === id && b.shopId === shopId));
      memoryStore.bundleItems = memoryStore.bundleItems.filter(i => i.bundleId !== id);
      memoryStore.bundleScores = memoryStore.bundleScores.filter(s => s.bundleId !== id);
      memoryStore.aiAnalyses = memoryStore.aiAnalyses.filter(a => a.bundleId !== id);
      memoryStore.alerts = memoryStore.alerts.filter(al => al.bundleId !== id);
    }
    return true;
  },

  // Scoring
  async saveBundleScore(bundleId: string, score: ScoreFactors, metricsSnapshot?: any) {
    const { db, isConnectedToMysql } = await getDb();
    const payload = {
      salesScore: score.salesScore.toFixed(2),
      compatibilityScore: score.compatibilityScore.toFixed(2),
      inventoryScore: score.inventoryScore.toFixed(2),
      discountScore: score.discountScore.toFixed(2),
      totalScore: score.totalScore.toFixed(2),
      scoreVersion: 'v1.0',
      metricsSnapshot: metricsSnapshot || null,
      updatedAt: new Date()
    };

    if (isConnectedToMysql && db) {
      const existing = await db.select().from(schema.bundleScores).where(eq(schema.bundleScores.bundleId, bundleId));
      if (existing.length > 0) {
        await db.update(schema.bundleScores).set(payload).where(eq(schema.bundleScores.bundleId, bundleId));
      } else {
        await db.insert(schema.bundleScores).values({
          id: 'score_' + Math.random().toString(36).substring(2, 11),
          bundleId,
          ...payload,
          createdAt: new Date()
        });
      }
    } else {
      const existingIndex = memoryStore.bundleScores.findIndex(s => s.bundleId === bundleId);
      if (existingIndex >= 0) {
        memoryStore.bundleScores[existingIndex] = { ...memoryStore.bundleScores[existingIndex], ...payload };
      } else {
        memoryStore.bundleScores.push({
          id: 'score_' + Math.random().toString(36).substring(2, 11),
          bundleId,
          ...payload,
          createdAt: new Date()
        });
      }
    }
  },

  // AI Analysis
  async saveAiAnalysis(bundleId: string, analysis: AiBundleAnalysisResult, model: string, rawResponse?: any) {
    const { db, isConnectedToMysql } = await getDb();
    const newRecord = {
      id: 'ai_analysis_' + Math.random().toString(36).substring(2, 11),
      bundleId,
      model,
      summary: analysis.summary,
      strengths: analysis.strengths,
      risks: analysis.risks,
      recommendations: analysis.recommendations,
      rawResponse: rawResponse || null,
      createdAt: new Date()
    };

    if (isConnectedToMysql && db) {
      await db.insert(schema.aiAnalyses).values(newRecord);
    } else {
      memoryStore.aiAnalyses.push(newRecord);
    }
    return newRecord;
  },

  // Activity Logs
  async createActivityLog(shopId: string, data: { bundleId?: string | null; action: string; description: string; metadata?: any }) {
    const { db, isConnectedToMysql } = await getDb();
    const log = {
      id: 'act_' + Math.random().toString(36).substring(2, 11),
      shopId,
      bundleId: data.bundleId || null,
      action: data.action,
      description: data.description,
      metadata: data.metadata || null,
      createdAt: new Date()
    };

    if (isConnectedToMysql && db) {
      await db.insert(schema.activityLogs).values(log);
    } else {
      memoryStore.activityLogs.unshift(log);
    }
    return log;
  },

  async getActivityLogsByShop(shopId: string, limit = 50): Promise<ActivityLogDto[]> {
    const { db, isConnectedToMysql } = await getDb();
    let logs: any[] = [];

    if (isConnectedToMysql && db) {
      logs = await db.select().from(schema.activityLogs)
        .where(eq(schema.activityLogs.shopId, shopId))
        .orderBy(desc(schema.activityLogs.createdAt))
        .limit(limit);
    } else {
      logs = memoryStore.activityLogs.filter(l => l.shopId === shopId).slice(0, limit);
    }

    return logs.map(l => {
      let bundleName = undefined;
      if (l.bundleId) {
        const bundle = memoryStore.bundles.find(b => b.id === l.bundleId);
        if (bundle) bundleName = bundle.name;
      }
      return {
        id: l.id,
        shopId: l.shopId,
        bundleId: l.bundleId,
        bundleName,
        action: l.action,
        description: l.description,
        metadata: typeof l.metadata === 'string' ? JSON.parse(l.metadata) : l.metadata,
        createdAt: l.createdAt?.toISOString?.() || new Date(l.createdAt).toISOString()
      };
    });
  },

  // Alerts
  async getAlertsByShop(shopId: string, status?: string): Promise<AlertDto[]> {
    const { db, isConnectedToMysql } = await getDb();
    let rows: any[] = [];

    if (isConnectedToMysql && db) {
      if (status) {
        rows = await db.select().from(schema.alerts)
          .where(and(eq(schema.alerts.shopId, shopId), eq(schema.alerts.status, status)))
          .orderBy(desc(schema.alerts.createdAt));
      } else {
        rows = await db.select().from(schema.alerts)
          .where(eq(schema.alerts.shopId, shopId))
          .orderBy(desc(schema.alerts.createdAt));
      }
    } else {
      rows = memoryStore.alerts.filter(a => a.shopId === shopId && (!status || a.status === status));
    }

    return rows.map(a => {
      const bundle = memoryStore.bundles.find(b => b.id === a.bundleId);
      return {
        id: a.id,
        shopId: a.shopId,
        bundleId: a.bundleId,
        bundleName: bundle?.name,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        status: a.status,
        createdAt: a.createdAt?.toISOString?.() || new Date(a.createdAt).toISOString(),
        resolvedAt: a.resolvedAt ? (a.resolvedAt.toISOString?.() || new Date(a.resolvedAt).toISOString()) : null
      };
    });
  },

  async getAlertsByBundle(bundleId: string, shopId: string): Promise<AlertDto[]> {
    const all = await this.getAlertsByShop(shopId);
    return all.filter(a => a.bundleId === bundleId);
  },

  async upsertAlert(shopId: string, data: {
    bundleId: string;
    type: 'inventory_critical' | 'inventory_warning' | 'performance_decline' | 'discount_anomaly';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
  }) {
    const { db, isConnectedToMysql } = await getDb();
    const existingAlerts = await this.getAlertsByShop(shopId);
    const existing = existingAlerts.find(a => a.bundleId === data.bundleId && a.type === data.type && a.status === 'active');

    if (existing) {
      if (isConnectedToMysql && db) {
        await db.update(schema.alerts).set({
          severity: data.severity,
          title: data.title,
          message: data.message
        }).where(eq(schema.alerts.id, existing.id));
      } else {
        const item = memoryStore.alerts.find(a => a.id === existing.id);
        if (item) {
          item.severity = data.severity;
          item.title = data.title;
          item.message = data.message;
        }
      }
      return existing.id;
    }

    const alertId = 'alert_' + Math.random().toString(36).substring(2, 11);
    const newAlert = {
      id: alertId,
      shopId,
      bundleId: data.bundleId,
      type: data.type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      status: 'active',
      createdAt: new Date(),
      resolvedAt: null
    };

    if (isConnectedToMysql && db) {
      await db.insert(schema.alerts).values(newAlert);
    } else {
      memoryStore.alerts.unshift(newAlert);
    }
    return alertId;
  },

  async resolveAlert(id: string, shopId: string) {
    const { db, isConnectedToMysql } = await getDb();
    if (isConnectedToMysql && db) {
      await db.update(schema.alerts).set({
        status: 'resolved',
        resolvedAt: new Date()
      }).where(and(eq(schema.alerts.id, id), eq(schema.alerts.shopId, shopId)));
    } else {
      const alert = memoryStore.alerts.find(a => a.id === id && a.shopId === shopId);
      if (alert) {
        alert.status = 'resolved';
        alert.resolvedAt = new Date();
      }
    }
    return true;
  }
};

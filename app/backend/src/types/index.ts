export interface ShopSession {
  shopId: string;
  shopifyDomain: string;
  accessToken: string;
}

export interface ScoreFactors {
  salesScore: number;         // 35% weight
  compatibilityScore: number; // 25% weight
  inventoryScore: number;     // 20% weight
  discountScore: number;      // 20% weight
  totalScore: number;         // 0 - 100
}

export interface ScoreBreakdown extends ScoreFactors {
  version: string;
  salesMetrics: {
    coOrderFrequency: number;
    combinedVelocity: number;
    totalOrdersEvaluated: number;
  };
  compatibilityMetrics: {
    categorySynergy: number;
    useCaseOverlap: number;
  };
  inventoryMetrics: {
    lowestStock: number;
    criticalItemCount: number;
    stockHealthRatio: number;
  };
  discountMetrics: {
    discountPercent: number;
    efficiencyRating: string;
  };
}

export interface AiBundleAnalysisResult {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
  model?: string;
  generatedAt?: string;
}

export interface BundleItemDto {
  id?: string;
  shopifyProductId: string;
  shopifyVariantId?: string;
  productTitle: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  inventoryQuantity?: number;
}

export interface BundleDto {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  status: 'active' | 'draft' | 'archived';
  discountPercent: number;
  targetCategory: string;
  items: BundleItemDto[];
  score?: ScoreFactors | null;
  latestAnalysis?: AiBundleAnalysisResult | null;
  activeAlertCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBundleRequest {
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
}

export interface UpdateBundleRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'draft' | 'archived';
  discountPercent?: number;
  targetCategory?: string;
  items?: Array<{
    id?: string;
    shopifyProductId: string;
    shopifyVariantId?: string;
    productTitle: string;
    variantTitle?: string;
    price: number;
    quantity: number;
  }>;
}

export interface ShopifyProductSummary {
  id: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  variants: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    inventoryQuantity: number;
    sku: string;
  }>;
}

export interface AlertDto {
  id: string;
  shopId: string;
  bundleId: string;
  bundleName?: string;
  type: 'inventory_critical' | 'inventory_warning' | 'performance_decline' | 'discount_anomaly';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  status: 'active' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string | null;
}

export interface ActivityLogDto {
  id: string;
  shopId: string;
  bundleId?: string | null;
  bundleName?: string;
  action: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

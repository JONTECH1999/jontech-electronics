export interface ScoreFactors {
  salesScore: number;
  compatibilityScore: number;
  inventoryScore: number;
  discountScore: number;
  totalScore: number;
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
  rank?: number;
  createdAt: string;
  updatedAt: string;
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

export interface SessionInfo {
  authenticated: boolean;
  shop: string;
  shopId: string;
  isDemoMode: boolean;
  apiVersion: string;
}

export interface ShopifyProductsResponse {
  success: boolean;
  products: ShopifyProductSummary[];
  isDemoData?: boolean;
  apiVersion?: string;
}

export interface DashboardData {
  isDemoMode?: boolean;
  apiVersion?: string;
  kpis: {
    totalBundles: number;
    activeBundles: number;
    averageScore: number;
    needingAttention: number;
  };
  topBundles: BundleDto[];
  recentAlerts: AlertDto[];
  recentActivity: ActivityLogDto[];
  aiInsights: Array<{ bundleName: string; summary: string; recommendation: string }>;
}

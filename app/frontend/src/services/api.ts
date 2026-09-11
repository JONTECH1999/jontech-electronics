import {
  DashboardData,
  BundleDto,
  AlertDto,
  ActivityLogDto,
  ShopifyProductSummary,
  AiBundleAnalysisResult,
  ScoreBreakdown,
  SessionInfo,
  ShopifyProductsResponse
} from '../types';

const getShopDomain = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('shop') || localStorage.getItem('kitflow_shop') || 'jontech-electronics.myshopify.com';
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const shopDomain = getShopDomain();
  const headers = new Headers(options.headers || {});

  headers.set('x-shopify-shop-domain', shopDomain);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Dashboard
  getDashboard: () => request<DashboardData>('/api/dashboard'),

  // Bundles
  getBundles: (status?: string, q?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (q) params.set('q', q);
    const qs = params.toString();
    return request<{ success: boolean; bundles: BundleDto[] }>(`/api/bundles${qs ? `?${qs}` : ''}`);
  },

  getBundle: (id: string) =>
    request<{ success: boolean; bundle: BundleDto }>(`/api/bundles/${id}`),

  createBundle: (payload: any) =>
    request<{ success: boolean; bundle: BundleDto }>('/api/bundles', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateBundle: (id: string, payload: any) =>
    request<{ success: boolean; bundle: BundleDto }>(`/api/bundles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  deleteBundle: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/bundles/${id}`, {
      method: 'DELETE'
    }),

  recalculateScore: (id: string) =>
    request<{ success: boolean; score: ScoreBreakdown; bundle: BundleDto }>(`/api/bundles/${id}/recalculate`, {
      method: 'POST'
    }),

  analyzeWithAi: (id: string) =>
    request<{ success: boolean; analysis: AiBundleAnalysisResult }>(`/api/bundles/${id}/analyze`, {
      method: 'POST'
    }),

  // Session & Metadata
  getSession: () =>
    request<SessionInfo>('/api/session'),

  // Shopify Products Catalog
  getShopifyProducts: () =>
    request<ShopifyProductsResponse>('/api/shopify/products'),

  // Activity Logs
  getActivity: (limit = 50) =>
    request<{ success: boolean; activity: ActivityLogDto[] }>(`/api/activity?limit=${limit}`),

  // Alerts
  getAlerts: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return request<{ success: boolean; alerts: AlertDto[] }>(`/api/alerts${qs}`);
  },

  resolveAlert: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/alerts/${id}/resolve`, {
      method: 'POST'
    }),

  // Settings
  getSettings: () =>
    request<{ success: boolean; settings: any }>('/api/settings'),

  updateSettings: (payload: any) =>
    request<{ success: boolean; settings: any }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
};

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
  return urlParams.get('shop') || localStorage.getItem('kitflow_shop') || 'jontech-electronics-xs08gbw3.myshopify.com';
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const shopDomain = getShopDomain();
  const headers = new Headers(options.headers || {});

  headers.set('x-shopify-shop-domain', shopDomain);

  // Fetch a fresh, short-lived ID token for each embedded-admin request.
  // Local storefront/demo testing works without App Bridge.
  if (window.shopify?.idToken) {
    try {
      headers.set('Authorization', `Bearer ${await window.shopify.idToken()}`);
    } catch {
      // The backend returns an actionable error when a live session is needed.
    }
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server returned invalid response (HTTP ${response.status}). Please check backend service.`);
  }

  if (!response.ok || data.success === false) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText || 'Service unavailable'}`;
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
    }),

  // Customers & Buyers
  getCustomers: (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return request<import('../types').CustomersResponseDto>(`/api/customers${qs}`);
  },

  getCustomer: (id: string) =>
    request<import('../types').CustomerDto>(`/api/customers/${id}`),

  syncCustomers: () =>
    request<import('../types').CustomersResponseDto & { success: boolean; message: string }>('/api/customers/sync', {
      method: 'POST'
    })
};


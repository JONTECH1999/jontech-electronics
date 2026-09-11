import { env } from '../../config/env';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; locations?: any[]; path?: string[] }>;
}

export class ShopifyGraphQLClient {
  private domain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(domain: string, accessToken: string, apiVersion?: string) {
    this.domain = domain;
    this.accessToken = accessToken;
    this.apiVersion = apiVersion || env.SHOPIFY_API_VERSION;
  }

  async query<T = any>(queryString: string, variables: Record<string, any> = {}): Promise<GraphQLResponse<T>> {
    // If running in development demo mode or using demo shop credentials, return simulated response
    if (env.USE_DEMO_DATA || this.domain === env.DEMO_SHOP_DOMAIN || this.accessToken.startsWith('shpat_demo')) {
      return { data: undefined };
    }

    const endpoint = `https://${this.domain}/admin/api/${this.apiVersion}/graphql.json`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.accessToken
        },
        body: JSON.stringify({ query: queryString, variables })
      });

      if (!response.ok) {
        throw new Error(`Shopify GraphQL HTTP error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as GraphQLResponse<T>;
    } catch (error: any) {
      console.error(`Shopify API (${this.apiVersion}) call failed for ${this.domain}:`, error.message);
      throw error;
    }
  }
}

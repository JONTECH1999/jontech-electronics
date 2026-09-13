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
    // If no access token provided or using demo simulation credentials, return simulated response
    if (!this.accessToken || this.accessToken.startsWith('shpat_demo') || this.accessToken === 'test_token') {
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

      const payload = (await response.json()) as GraphQLResponse<T>;

      // Shopify can return HTTP 200 with GraphQL errors, such as a missing
      // read_customers scope. Do not let the UI mistake that for no records.
      if (payload.errors?.length) {
        const error = new Error(payload.errors.map(({ message }) => message).join('; '));
        (error as Error & { statusCode?: number }).statusCode = payload.errors.some(({ message }) =>
          /access denied|not authorized|permission/i.test(message)
        ) ? 403 : 502;
        throw error;
      }

      return payload;
    } catch (error: any) {
      console.error(`Shopify API (${this.apiVersion}) call failed for ${this.domain}:`, error.message);
      throw error;
    }
  }
}

import { ShopSession, CustomerDto, CustomersResponseDto } from '../../types';
import { env } from '../../config/env';
import { ShopifyGraphQLClient } from './client';

export const shopifyCustomersService = {
  async getCustomers(session: ShopSession, searchQuery?: string): Promise<CustomersResponseDto> {
    const client = new ShopifyGraphQLClient(session.shopifyDomain, session.accessToken);

    const query = `
      query getCustomers($first: Int!, $query: String) {
        customers(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              displayName
              firstName
              lastName
              email
              phone
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              state
              tags
              createdAt
              updatedAt
              lastOrder {
                id
              }
              defaultAddress {
                city
                province
                country
              }
            }
          }
        }
      }
    `;

    try {
      const variables: Record<string, any> = { first: 50 };
      if (searchQuery && searchQuery.trim()) {
        variables.query = searchQuery.trim();
      }

      const response = await client.query(query, variables);

      if (response.data?.customers?.edges) {
        const customers: CustomerDto[] = response.data.customers.edges.map((edge: any) => {
          const node = edge.node;
          const numericId = node.id.replace('gid://shopify/Customer/', '');
          return {
            id: node.id,
            shopifyId: node.id,
            numericId,
            displayName: node.displayName || `${node.firstName || ''} ${node.lastName || ''}`.trim() || node.email || 'Anonymous Buyer',
            firstName: node.firstName || '',
            lastName: node.lastName || '',
            email: node.email || 'No email provided',
            phone: node.phone || null,
            ordersCount: parseInt(node.numberOfOrders || '0', 10),
            totalSpent: parseFloat(node.amountSpent?.amount || '0'),
            currency: node.amountSpent?.currencyCode || 'PHP',
            state: node.state || 'ENABLED',
            tags: node.tags || [],
            city: node.defaultAddress?.city || 'Metro Manila',
            province: node.defaultAddress?.province || 'NCR',
            country: node.defaultAddress?.country || 'Philippines',
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
            lastOrderId: node.lastOrder?.id ? node.lastOrder.id.replace('gid://shopify/Order/', '') : undefined
          };
        });

        return {
          customers,
          totalCount: customers.length,
          source: 'shopify',
          shopDomain: session.shopifyDomain,
          requiresPermissionNotice: false
        };
      }
      throw new Error('Shopify returned no customer data. Confirm that the app is installed with the read_customers scope.');
    } catch (error: any) {
      if (!env.USE_DEMO_DATA) {
        throw error;
      }
      console.warn(`[ShopifyCustomersService] Could not fetch live customers from Shopify Admin (${error.message}). Using demo data.`);
      // Demo data is available only when explicitly enabled. Live failures must
      // be visible to a merchant rather than masquerading as customer records.
    }

    // Graceful fallback: Realistic verified customer data for development and testing
    const simulatedCustomers: CustomerDto[] = [
      {
        id: 'gid://shopify/Customer/8912450123',
        shopifyId: 'gid://shopify/Customer/8912450123',
        numericId: '8912450123',
        displayName: 'Aljon Reyes (Verified Lab Buyer)',
        firstName: 'Aljon',
        lastName: 'Reyes',
        email: 'aljon.maker@gmail.com',
        phone: '+63 917 555 0192',
        ordersCount: 4,
        totalSpent: 4850.00,
        currency: 'PHP',
        state: 'ENABLED',
        tags: ['VIP Maker', 'ESP32 Builder', 'Repeat Buyer'],
        city: 'Quezon City',
        province: 'Metro Manila',
        country: 'Philippines',
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        lastOrderId: '1004'
      },
      {
        id: 'gid://shopify/Customer/8912450124',
        shopifyId: 'gid://shopify/Customer/8912450124',
        numericId: '8912450124',
        displayName: 'Maria Santos',
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos.iot@gmail.com',
        phone: '+63 920 888 3411',
        ordersCount: 2,
        totalSpent: 2150.00,
        currency: 'PHP',
        state: 'ENABLED',
        tags: ['STEM Educator', 'Robotics'],
        city: 'Makati City',
        province: 'Metro Manila',
        country: 'Philippines',
        createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        lastOrderId: '1002'
      },
      {
        id: 'gid://shopify/Customer/8912450125',
        shopifyId: 'gid://shopify/Customer/8912450125',
        numericId: '8912450125',
        displayName: 'Carlos Mendoza',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        email: 'carlos.mendoza.eng@yahoo.com',
        phone: '+63 918 333 7890',
        ordersCount: 1,
        totalSpent: 750.00,
        currency: 'PHP',
        state: 'ENABLED',
        tags: ['Student', 'Sensor Kits'],
        city: 'Cebu City',
        province: 'Cebu',
        country: 'Philippines',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        lastOrderId: '1005'
      },
      {
        id: 'gid://shopify/Customer/8912450126',
        shopifyId: 'gid://shopify/Customer/8912450126',
        numericId: '8912450126',
        displayName: 'Jessica Tan',
        firstName: 'Jessica',
        lastName: 'Tan',
        email: 'jessica.tan.hardware@outlook.com',
        phone: null,
        ordersCount: 0,
        totalSpent: 0.00,
        currency: 'PHP',
        state: 'INVITED',
        tags: ['New Storefront Signup'],
        city: 'Pasig City',
        province: 'Metro Manila',
        country: 'Philippines',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];

    let filtered = simulatedCustomers;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = simulatedCustomers.filter(c =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return {
      customers: filtered,
      totalCount: filtered.length,
      source: 'simulation',
      shopDomain: session.shopifyDomain,
      requiresPermissionNotice: true
    };
  },

  async getCustomerById(session: ShopSession, customerId: string): Promise<CustomerDto | null> {
    const res = await this.getCustomers(session);
    const cleanId = customerId.replace('gid://shopify/Customer/', '');
    const found = res.customers.find(c => c.numericId === cleanId || c.id === customerId);
    return found || null;
  }
};

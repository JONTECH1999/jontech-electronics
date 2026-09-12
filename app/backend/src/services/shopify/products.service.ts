import { ShopifyGraphQLClient } from './client';
import { ShopSession, ShopifyProductSummary } from '../../types';
import { env } from '../../config/env';

// Realistic JonTech Electronics catalog: Microcontrollers, Sensors, Modules, Prototyping
export const DEMO_PRODUCTS: ShopifyProductSummary[] = [
  {
    id: 'gid://shopify/Product/101',
    title: 'ESP32 NodeMCU DevKit v1 (30-Pin WiFi+BLE)',
    vendor: 'Espressif / JonTech',
    productType: 'Microcontroller',
    tags: ['Microcontroller', 'IoT', 'WiFi', 'Bluetooth', 'ESP32', 'Prototyping'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1011',
        title: '30-Pin CP2102 USB-C',
        price: 280.00,
        compareAtPrice: 320.00,
        inventoryQuantity: 45,
        sku: 'JT-MCU-ESP32-30P'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/102',
    title: 'Arduino Uno R3 (ATmega328P + CH340G)',
    vendor: 'Arduino / JonTech',
    productType: 'Microcontroller',
    tags: ['Microcontroller', 'Arduino', 'School', 'STEM', 'Prototyping'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1021',
        title: 'DIP Edition + USB Cable',
        price: 350.00,
        compareAtPrice: 399.00,
        inventoryQuantity: 32,
        sku: 'JT-MCU-UNO-R3'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/103',
    title: 'Raspberry Pi 4 Model B (4GB RAM)',
    vendor: 'Raspberry Pi Foundation',
    productType: 'Single Board Computer',
    tags: ['SBC', 'Raspberry Pi', 'Linux', 'Edge AI', 'Prototyping'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1031',
        title: 'Quad-Core 64-bit Linux',
        price: 3899.00,
        compareAtPrice: 4299.00,
        inventoryQuantity: 12,
        sku: 'JT-SBC-RPI4-4GB'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/104',
    title: 'STM32F401 "Black Pill" ARM Cortex-M4 Board',
    vendor: 'STMicroelectronics / WeAct',
    productType: 'Microcontroller',
    tags: ['Microcontroller', 'ARM', 'STM32', 'Cortex-M4', 'Embedded'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1041',
        title: '84MHz 256KB Flash USB-C',
        price: 240.00,
        compareAtPrice: 280.00,
        inventoryQuantity: 28,
        sku: 'JT-MCU-STM32-F401'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/105',
    title: 'DHT22 Digital Temperature & Humidity Sensor',
    vendor: 'JonTech Sensors',
    productType: 'Environmental Sensor',
    tags: ['Sensor', 'Temperature', 'Humidity', 'IoT', 'DHT22'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1051',
        title: 'High-Precision Module',
        price: 195.00,
        compareAtPrice: 240.00,
        inventoryQuantity: 50,
        sku: 'JT-SEN-DHT22-MOD'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/106',
    title: 'HC-SR04 Ultrasonic Distance Sensor',
    vendor: 'JonTech Sensors',
    productType: 'Distance Sensor',
    tags: ['Sensor', 'Ultrasonic', 'Robotics', 'Obstacle Avoidance', 'School'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1061',
        title: '5V Echo Transducer',
        price: 85.00,
        compareAtPrice: 110.00,
        inventoryQuantity: 60,
        sku: 'JT-SEN-HCSR04'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/107',
    title: 'TFmini-S Micro Solid-State LiDAR Sensor',
    vendor: 'Benewake / JonTech',
    productType: 'LiDAR Sensor',
    tags: ['Sensor', 'LiDAR', 'Robotics', 'High Precision', 'Distance'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1071',
        title: 'UART / I2C 12m Rangefinder',
        price: 1850.00,
        compareAtPrice: 2100.00,
        inventoryQuantity: 2, // Low inventory to demonstrate alerts
        sku: 'JT-SEN-TFMINI-S'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/108',
    title: '0.96 inch I2C OLED Display (128x64)',
    vendor: 'JonTech Displays',
    productType: 'Display Module',
    tags: ['Display', 'OLED', 'I2C', 'Visualizer', 'Prototyping'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1081',
        title: '4-Pin I2C Blue/White',
        price: 145.00,
        compareAtPrice: 180.00,
        inventoryQuantity: 38,
        sku: 'JT-DSP-OLED-096'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/109',
    title: 'L298N Dual H-Bridge DC Motor Driver',
    vendor: 'JonTech Power',
    productType: 'Motor Driver',
    tags: ['Robotics', 'Motor Driver', 'H-Bridge', 'School', 'DC Motor'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1091',
        title: '2A Peak Driver Board',
        price: 120.00,
        compareAtPrice: 150.00,
        inventoryQuantity: 30,
        sku: 'JT-MOD-L298N'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/110',
    title: '4-Channel 5V Relay Module with Optocoupler',
    vendor: 'JonTech Industrial',
    productType: 'Relay Module',
    tags: ['Module', 'Relay', 'Automation', 'Home Automation', '5V'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1101',
        title: '250VAC 10A Active Low',
        price: 165.00,
        compareAtPrice: 200.00,
        inventoryQuantity: 25,
        sku: 'JT-MOD-RELAY-4CH'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/111',
    title: 'SG90 9g Micro Servo Motor',
    vendor: 'TowerPro / JonTech',
    productType: 'Actuator',
    tags: ['Actuator', 'Servo', 'Robotics', 'School', 'STEM'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1111',
        title: '180-Degree Nylon Gear',
        price: 95.00,
        compareAtPrice: 125.00,
        inventoryQuantity: 40,
        sku: 'JT-ACT-SG90'
      }
    ]
  },
  {
    id: 'gid://shopify/Product/112',
    title: 'Master Solderless Breadboard & 65-pc Jumper Wires',
    vendor: 'JonTech Lab',
    productType: 'Prototyping Accessory',
    tags: ['Prototyping', 'Breadboard', 'Wires', 'School', 'Essentials'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/1121',
        title: '830-Point MB-102 Kit',
        price: 175.00,
        compareAtPrice: 220.00,
        inventoryQuantity: 55,
        sku: 'JT-ACC-BB830-65J'
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
    if (
      env.USE_DEMO_DATA ||
      session.shopifyDomain === 'test-store.myshopify.com' ||
      session.accessToken === 'test_token' ||
      session.accessToken.startsWith('demo_') ||
      session.accessToken.startsWith('shpat_demo') ||
      !session.accessToken
    ) {
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
      if (response.data?.products?.edges !== undefined) {
        const products = response.data.products.edges.map((edge: any) => {
          const p = edge.node;
          return {
            id: p.id,
            title: p.title,
            vendor: p.vendor || 'JonTech Electronics',
            productType: p.productType || 'Hardware',
            tags: p.tags || [],
            variants: (p.variants?.edges || []).map((v: any) => ({
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

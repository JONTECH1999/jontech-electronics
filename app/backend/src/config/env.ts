import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend root or app root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().default('http://localhost:3000'),

  // Shopify App Configuration
  SHOPIFY_API_KEY: z.string().default('demo_shopify_api_key'),
  SHOPIFY_API_SECRET: z.string().default('demo_shopify_api_secret'),
  SHOPIFY_APP_URL: z.string().default('http://localhost:3000'),
  SHOPIFY_SCOPES: z.string().default('read_products,write_products,read_orders,read_inventory'),
  SHOPIFY_API_VERSION: z.string().default('2026-07'),

  // Database Configuration
  DATABASE_URL: z.string().optional().default('mysql://root:password@127.0.0.1:3306/kitflow_db'),

  // Anthropic API Configuration (Server-Side Only - Never Exposed to Frontend)
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  ANTHROPIC_MODEL: z.string().default('claude-3-7-sonnet-latest'),

  // Safe Development Demo Fallback
  USE_DEMO_DATA: z.string().transform(v => v === 'true' || v === '1').default('true'),
  DEMO_SHOP_DOMAIN: z.string().default('jontech-electronics.myshopify.com')
});

export const env = envSchema.parse(process.env);

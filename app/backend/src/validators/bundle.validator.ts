import { z } from 'zod';

export const createBundleSchema = z.object({
  name: z.string().trim().min(2, 'Bundle name must be at least 2 characters long').max(150, 'Bundle name cannot exceed 150 characters'),
  description: z.string().trim().max(1000).optional().nullable(),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  discountPercent: z.number().min(0, 'Discount percentage cannot be negative').max(75, 'Discount percentage cannot exceed 75%'),
  targetCategory: z.string().trim().min(1).default('General'),
  items: z.array(
    z.object({
      shopifyProductId: z.string().min(1, 'Shopify product ID is required'),
      shopifyVariantId: z.string().optional().nullable(),
      productTitle: z.string().min(1, 'Product title is required'),
      variantTitle: z.string().optional().nullable(),
      price: z.number().nonnegative('Price cannot be negative'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'A bundle must contain at least 1 product item')
});

export const updateBundleSchema = z.object({
  name: z.string().trim().min(2, 'Bundle name must be at least 2 characters long').max(150).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  discountPercent: z.number().min(0).max(75).optional(),
  targetCategory: z.string().trim().min(1).optional(),
  items: z.array(
    z.object({
      id: z.string().optional(),
      shopifyProductId: z.string().min(1, 'Shopify product ID is required'),
      shopifyVariantId: z.string().optional().nullable(),
      productTitle: z.string().min(1, 'Product title is required'),
      variantTitle: z.string().optional().nullable(),
      price: z.number().nonnegative('Price cannot be negative'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1')
    })
  ).min(1, 'A bundle must contain at least 1 product item').optional()
});

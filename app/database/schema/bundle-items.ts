import { mysqlTable, varchar, int, decimal, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { bundles } from './bundles';

export const bundleItems = mysqlTable('bundle_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  bundleId: varchar('bundle_id', { length: 36 }).notNull().references(() => bundles.id, { onDelete: 'cascade' }),
  shopifyProductId: varchar('shopify_product_id', { length: 255 }).notNull(),
  shopifyVariantId: varchar('shopify_variant_id', { length: 255 }),
  productTitle: varchar('product_title', { length: 255 }).notNull(),
  variantTitle: varchar('variant_title', { length: 255 }),
  price: decimal('price', { precision: 10, scale: 2 }).default('0.00').notNull(),
  quantity: int('quantity').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const bundleItemsRelations = relations(bundleItems, ({ one }) => ({
  bundle: one(bundles, {
    fields: [bundleItems.bundleId],
    references: [bundles.id]
  })
}));

export type BundleItem = typeof bundleItems.$inferSelect;
export type NewBundleItem = typeof bundleItems.$inferInsert;

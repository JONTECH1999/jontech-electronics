import { mysqlTable, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { bundles } from './bundles';
import { activityLogs } from './activity-logs';
import { alerts } from './alerts';

export const shops = mysqlTable('shops', {
  id: varchar('id', { length: 36 }).primaryKey(),
  shopifyDomain: varchar('shopify_domain', { length: 255 }).notNull().unique(),
  shopifyStoreId: varchar('shopify_store_id', { length: 255 }),
  accessToken: text('access_token').notNull(),
  scope: varchar('scope', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const shopsRelations = relations(shops, ({ many }) => ({
  bundles: many(bundles),
  activityLogs: many(activityLogs),
  alerts: many(alerts)
}));

export type Shop = typeof shops.$inferSelect;
export type NewShop = typeof shops.$inferInsert;

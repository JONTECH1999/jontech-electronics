import { mysqlTable, varchar, text, mysqlEnum, decimal, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { shops } from './shops';
import { bundleItems } from './bundle-items';
import { bundleScores } from './bundle-scores';
import { aiAnalyses } from './ai-analyses';
import { alerts } from './alerts';
import { activityLogs } from './activity-logs';

export const bundles = mysqlTable('bundles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  shopId: varchar('shop_id', { length: 36 }).notNull().references(() => shops.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['active', 'draft', 'archived']).default('draft').notNull(),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0.00').notNull(),
  targetCategory: varchar('target_category', { length: 100 }).default('General').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const bundlesRelations = relations(bundles, ({ one, many }) => ({
  shop: one(shops, {
    fields: [bundles.shopId],
    references: [shops.id]
  }),
  items: many(bundleItems),
  score: one(bundleScores, {
    fields: [bundles.id],
    references: [bundleScores.bundleId]
  }),
  aiAnalyses: many(aiAnalyses),
  alerts: many(alerts),
  activityLogs: many(activityLogs)
}));

export type Bundle = typeof bundles.$inferSelect;
export type NewBundle = typeof bundles.$inferInsert;

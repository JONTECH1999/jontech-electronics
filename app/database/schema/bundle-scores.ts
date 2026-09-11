import { mysqlTable, varchar, decimal, json, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { bundles } from './bundles';

export const bundleScores = mysqlTable('bundle_scores', {
  id: varchar('id', { length: 36 }).primaryKey(),
  bundleId: varchar('bundle_id', { length: 36 }).notNull().unique().references(() => bundles.id, { onDelete: 'cascade' }),
  salesScore: decimal('sales_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
  compatibilityScore: decimal('compatibility_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
  inventoryScore: decimal('inventory_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
  discountScore: decimal('discount_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
  scoreVersion: varchar('score_version', { length: 20 }).default('v1.0').notNull(),
  metricsSnapshot: json('metrics_snapshot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const bundleScoresRelations = relations(bundleScores, ({ one }) => ({
  bundle: one(bundles, {
    fields: [bundleScores.bundleId],
    references: [bundles.id]
  })
}));

export type BundleScore = typeof bundleScores.$inferSelect;
export type NewBundleScore = typeof bundleScores.$inferInsert;

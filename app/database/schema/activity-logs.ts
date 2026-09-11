import { mysqlTable, varchar, text, json, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { shops } from './shops';
import { bundles } from './bundles';

export const activityLogs = mysqlTable('activity_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  shopId: varchar('shop_id', { length: 36 }).notNull().references(() => shops.id, { onDelete: 'cascade' }),
  bundleId: varchar('bundle_id', { length: 36 }).references(() => bundles.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  description: text('description').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  shop: one(shops, {
    fields: [activityLogs.shopId],
    references: [shops.id]
  }),
  bundle: one(bundles, {
    fields: [activityLogs.bundleId],
    references: [bundles.id]
  })
}));

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

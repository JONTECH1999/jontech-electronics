import { mysqlTable, varchar, text, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { shops } from './shops';
import { bundles } from './bundles';

export const alerts = mysqlTable('alerts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  shopId: varchar('shop_id', { length: 36 }).notNull().references(() => shops.id, { onDelete: 'cascade' }),
  bundleId: varchar('bundle_id', { length: 36 }).notNull().references(() => bundles.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at')
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  shop: one(shops, {
    fields: [alerts.shopId],
    references: [shops.id]
  }),
  bundle: one(bundles, {
    fields: [alerts.bundleId],
    references: [bundles.id]
  })
}));

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

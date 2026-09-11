"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsRelations = exports.alerts = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const shops_1 = require("./shops");
const bundles_1 = require("./bundles");
exports.alerts = (0, mysql_core_1.mysqlTable)('alerts', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    shopId: (0, mysql_core_1.varchar)('shop_id', { length: 36 }).notNull().references(() => shops_1.shops.id, { onDelete: 'cascade' }),
    bundleId: (0, mysql_core_1.varchar)('bundle_id', { length: 36 }).notNull().references(() => bundles_1.bundles.id, { onDelete: 'cascade' }),
    type: (0, mysql_core_1.varchar)('type', { length: 50 }).notNull(),
    severity: (0, mysql_core_1.varchar)('severity', { length: 20 }).notNull(),
    title: (0, mysql_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, mysql_core_1.text)('message').notNull(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).default('active').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    resolvedAt: (0, mysql_core_1.timestamp)('resolved_at')
});
exports.alertsRelations = (0, drizzle_orm_1.relations)(exports.alerts, ({ one }) => ({
    shop: one(shops_1.shops, {
        fields: [exports.alerts.shopId],
        references: [shops_1.shops.id]
    }),
    bundle: one(bundles_1.bundles, {
        fields: [exports.alerts.bundleId],
        references: [bundles_1.bundles.id]
    })
}));

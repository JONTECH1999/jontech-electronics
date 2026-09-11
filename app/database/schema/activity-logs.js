"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogsRelations = exports.activityLogs = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const shops_1 = require("./shops");
const bundles_1 = require("./bundles");
exports.activityLogs = (0, mysql_core_1.mysqlTable)('activity_logs', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    shopId: (0, mysql_core_1.varchar)('shop_id', { length: 36 }).notNull().references(() => shops_1.shops.id, { onDelete: 'cascade' }),
    bundleId: (0, mysql_core_1.varchar)('bundle_id', { length: 36 }).references(() => bundles_1.bundles.id, { onDelete: 'set null' }),
    action: (0, mysql_core_1.varchar)('action', { length: 100 }).notNull(),
    description: (0, mysql_core_1.text)('description').notNull(),
    metadata: (0, mysql_core_1.json)('metadata'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.activityLogsRelations = (0, drizzle_orm_1.relations)(exports.activityLogs, ({ one }) => ({
    shop: one(shops_1.shops, {
        fields: [exports.activityLogs.shopId],
        references: [shops_1.shops.id]
    }),
    bundle: one(bundles_1.bundles, {
        fields: [exports.activityLogs.bundleId],
        references: [bundles_1.bundles.id]
    })
}));

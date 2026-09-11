"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopsRelations = exports.shops = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const bundles_1 = require("./bundles");
const activity_logs_1 = require("./activity-logs");
const alerts_1 = require("./alerts");
exports.shops = (0, mysql_core_1.mysqlTable)('shops', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    shopifyDomain: (0, mysql_core_1.varchar)('shopify_domain', { length: 255 }).notNull().unique(),
    shopifyStoreId: (0, mysql_core_1.varchar)('shopify_store_id', { length: 255 }),
    accessToken: (0, mysql_core_1.text)('access_token').notNull(),
    scope: (0, mysql_core_1.varchar)('scope', { length: 500 }),
    isActive: (0, mysql_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull()
});
exports.shopsRelations = (0, drizzle_orm_1.relations)(exports.shops, ({ many }) => ({
    bundles: many(bundles_1.bundles),
    activityLogs: many(activity_logs_1.activityLogs),
    alerts: many(alerts_1.alerts)
}));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundlesRelations = exports.bundles = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const shops_1 = require("./shops");
const bundle_items_1 = require("./bundle-items");
const bundle_scores_1 = require("./bundle-scores");
const ai_analyses_1 = require("./ai-analyses");
const alerts_1 = require("./alerts");
const activity_logs_1 = require("./activity-logs");
exports.bundles = (0, mysql_core_1.mysqlTable)('bundles', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    shopId: (0, mysql_core_1.varchar)('shop_id', { length: 36 }).notNull().references(() => shops_1.shops.id, { onDelete: 'cascade' }),
    name: (0, mysql_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    status: (0, mysql_core_1.mysqlEnum)('status', ['active', 'draft', 'archived']).default('draft').notNull(),
    discountPercent: (0, mysql_core_1.decimal)('discount_percent', { precision: 5, scale: 2 }).default('0.00').notNull(),
    targetCategory: (0, mysql_core_1.varchar)('target_category', { length: 100 }).default('General').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull()
});
exports.bundlesRelations = (0, drizzle_orm_1.relations)(exports.bundles, ({ one, many }) => ({
    shop: one(shops_1.shops, {
        fields: [exports.bundles.shopId],
        references: [shops_1.shops.id]
    }),
    items: many(bundle_items_1.bundleItems),
    score: one(bundle_scores_1.bundleScores, {
        fields: [exports.bundles.id],
        references: [bundle_scores_1.bundleScores.bundleId]
    }),
    aiAnalyses: many(ai_analyses_1.aiAnalyses),
    alerts: many(alerts_1.alerts),
    activityLogs: many(activity_logs_1.activityLogs)
}));

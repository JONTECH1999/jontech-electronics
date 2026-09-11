"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleScoresRelations = exports.bundleScores = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const bundles_1 = require("./bundles");
exports.bundleScores = (0, mysql_core_1.mysqlTable)('bundle_scores', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    bundleId: (0, mysql_core_1.varchar)('bundle_id', { length: 36 }).notNull().unique().references(() => bundles_1.bundles.id, { onDelete: 'cascade' }),
    salesScore: (0, mysql_core_1.decimal)('sales_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
    compatibilityScore: (0, mysql_core_1.decimal)('compatibility_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
    inventoryScore: (0, mysql_core_1.decimal)('inventory_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
    discountScore: (0, mysql_core_1.decimal)('discount_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
    totalScore: (0, mysql_core_1.decimal)('total_score', { precision: 5, scale: 2 }).default('0.00').notNull(),
    scoreVersion: (0, mysql_core_1.varchar)('score_version', { length: 20 }).default('v1.0').notNull(),
    metricsSnapshot: (0, mysql_core_1.json)('metrics_snapshot'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow().notNull()
});
exports.bundleScoresRelations = (0, drizzle_orm_1.relations)(exports.bundleScores, ({ one }) => ({
    bundle: one(bundles_1.bundles, {
        fields: [exports.bundleScores.bundleId],
        references: [bundles_1.bundles.id]
    })
}));

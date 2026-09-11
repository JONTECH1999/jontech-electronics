"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiAnalysesRelations = exports.aiAnalyses = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const bundles_1 = require("./bundles");
exports.aiAnalyses = (0, mysql_core_1.mysqlTable)('ai_analyses', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    bundleId: (0, mysql_core_1.varchar)('bundle_id', { length: 36 }).notNull().references(() => bundles_1.bundles.id, { onDelete: 'cascade' }),
    model: (0, mysql_core_1.varchar)('model', { length: 100 }).notNull(),
    summary: (0, mysql_core_1.text)('summary').notNull(),
    strengths: (0, mysql_core_1.json)('strengths').notNull(),
    risks: (0, mysql_core_1.json)('risks').notNull(),
    recommendations: (0, mysql_core_1.json)('recommendations').notNull(),
    rawResponse: (0, mysql_core_1.json)('raw_response'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.aiAnalysesRelations = (0, drizzle_orm_1.relations)(exports.aiAnalyses, ({ one }) => ({
    bundle: one(bundles_1.bundles, {
        fields: [exports.aiAnalyses.bundleId],
        references: [bundles_1.bundles.id]
    })
}));

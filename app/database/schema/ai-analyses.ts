import { mysqlTable, varchar, text, json, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { bundles } from './bundles';

export const aiAnalyses = mysqlTable('ai_analyses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  bundleId: varchar('bundle_id', { length: 36 }).notNull().references(() => bundles.id, { onDelete: 'cascade' }),
  model: varchar('model', { length: 100 }).notNull(),
  summary: text('summary').notNull(),
  strengths: json('strengths').notNull(),
  risks: json('risks').notNull(),
  recommendations: json('recommendations').notNull(),
  rawResponse: json('raw_response'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  bundle: one(bundles, {
    fields: [aiAnalyses.bundleId],
    references: [bundles.id]
  })
}));

export type AiAnalysis = typeof aiAnalyses.$inferSelect;
export type NewAiAnalysis = typeof aiAnalyses.$inferInsert;

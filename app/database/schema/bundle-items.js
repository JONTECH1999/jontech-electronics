"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bundleItemsRelations = exports.bundleItems = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const bundles_1 = require("./bundles");
exports.bundleItems = (0, mysql_core_1.mysqlTable)('bundle_items', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    bundleId: (0, mysql_core_1.varchar)('bundle_id', { length: 36 }).notNull().references(() => bundles_1.bundles.id, { onDelete: 'cascade' }),
    shopifyProductId: (0, mysql_core_1.varchar)('shopify_product_id', { length: 255 }).notNull(),
    shopifyVariantId: (0, mysql_core_1.varchar)('shopify_variant_id', { length: 255 }),
    productTitle: (0, mysql_core_1.varchar)('product_title', { length: 255 }).notNull(),
    variantTitle: (0, mysql_core_1.varchar)('variant_title', { length: 255 }),
    price: (0, mysql_core_1.decimal)('price', { precision: 10, scale: 2 }).default('0.00').notNull(),
    quantity: (0, mysql_core_1.int)('quantity').default(1).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow().notNull()
});
exports.bundleItemsRelations = (0, drizzle_orm_1.relations)(exports.bundleItems, ({ one }) => ({
    bundle: one(bundles_1.bundles, {
        fields: [exports.bundleItems.bundleId],
        references: [bundles_1.bundles.id]
    })
}));

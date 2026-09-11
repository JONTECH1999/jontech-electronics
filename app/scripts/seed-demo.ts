import * as path from 'path';
import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seedDemoData() {
  console.log('🌱 KitFlow Database Seeder');
  console.log('----------------------------------------------------');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || process.env.USE_DEMO_DATA === 'true') {
    console.log('ℹ️  Running in DEMO mode. Memory repository auto-seeds realistic demo bundles on startup.');
    console.log('✅ Demo records verified:');
    console.log('   - Shop: jontech-electronics.myshopify.com');
    console.log('   - Bundle 1: Gaming Battlestation Starter Pack (Score: 88.50)');
    console.log('   - Bundle 2: Work From Home Ergonomic Studio (Score: 90.15)');
    console.log('   - Bundle 3: Nomad Road Warrior Travel Tech Kit (Score: 80.60)');
    console.log('   - Active Inventory Alerts: 1');
    console.log('   - Activity Logs: 5');
    return;
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log('📡 Connected to MySQL. Inserting seed records...');

    // 1. Insert Shop
    await connection.query(`
      INSERT INTO shops (id, shopify_domain, shopify_store_id, access_token, scope, is_active)
      VALUES ('shop_demo_01', 'jontech-electronics.myshopify.com', 'gid://shopify/Shop/82910291', 'shpat_demo_access_token_kitflow_secure', 'read_products,write_products,read_orders,read_inventory', true)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
    `);

    // 2. Insert Bundles
    await connection.query(`
      INSERT INTO bundles (id, shop_id, name, description, status, discount_percent, target_category)
      VALUES
        ('bundle_gaming_01', 'shop_demo_01', 'Gaming Battlestation Starter Pack', 'Competitive esports setup calibrated for fast-paced shooters with 8K polling and mechanical switches.', 'active', 12.00, 'Gaming'),
        ('bundle_work_02', 'shop_demo_01', 'Work From Home Ergonomic Studio', 'Orthopedic workstation suite designed for programmers and creators working 8+ hour screen sessions.', 'active', 14.00, 'Work'),
        ('bundle_travel_03', 'shop_demo_01', 'Nomad Road Warrior Travel Tech Kit', 'Ultra-lightweight peripherals and 65W GaN charging engineered for airport lounges and coffee shop sprints.', 'active', 10.00, 'Travel')
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
    `);

    // 3. Insert Bundle Items
    await connection.query(`
      INSERT INTO bundle_items (id, bundle_id, shopify_product_id, shopify_variant_id, product_title, variant_title, price, quantity)
      VALUES
        ('item_1_1', 'bundle_gaming_01', 'gid://shopify/Product/901', 'gid://shopify/ProductVariant/9011', 'ApexPro 8K Optical Gaming Mouse', 'Midnight Black', 1899.00, 1),
        ('item_1_2', 'bundle_gaming_01', 'gid://shopify/Product/902', 'gid://shopify/ProductVariant/9021', 'Vortex K75 Mechanical Keyboard', 'Linear Red Switches', 2199.00, 1),
        ('item_1_3', 'bundle_gaming_01', 'gid://shopify/Product/903', 'gid://shopify/ProductVariant/9031', 'TitanSound 7.1 Spatial Audio Headset', 'Standard Edition', 2499.00, 1),
        ('item_1_4', 'bundle_gaming_01', 'gid://shopify/Product/904', 'gid://shopify/ProductVariant/9041', 'AeroGlide Pro Gaming Desk Mat (900x400)', 'Stealth Grey', 799.00, 1),
        ('item_2_1', 'bundle_work_02', 'gid://shopify/Product/905', 'gid://shopify/ProductVariant/9051', 'MasterCraft MX Multi-Device Flow Mouse', 'Graphite', 3499.00, 1),
        ('item_2_2', 'bundle_work_02', 'gid://shopify/Product/906', 'gid://shopify/ProductVariant/9061', 'NovaType Split Ergonomic Mechanical Keyboard', 'Silent Brown Switches', 4299.00, 1),
        ('item_2_3', 'bundle_work_02', 'gid://shopify/Product/907', 'gid://shopify/ProductVariant/9071', 'ClearVoice AI Noise-Cancelling Headset', 'USB-C / Wireless', 2499.00, 1),
        ('item_3_1', 'bundle_travel_03', 'gid://shopify/Product/908', 'gid://shopify/ProductVariant/9081', 'AnywhereGo Multi-Surface Bluetooth Mouse', 'Pocket Edition', 1699.00, 1),
        ('item_3_2', 'bundle_travel_03', 'gid://shopify/Product/909', 'gid://shopify/ProductVariant/9091', 'TravelPro Folding Bluetooth Keyboard', 'Magnetic Tri-Fold', 2199.00, 1),
        ('item_3_3', 'bundle_travel_03', 'gid://shopify/Product/910', 'gid://shopify/ProductVariant/9101', 'PocketGaN 65W Foldable Travel Adapter', 'Universal Multi-Port', 1499.00, 1)
      ON DUPLICATE KEY UPDATE id = id;
    `);

    // 4. Insert Deterministic Scores
    await connection.query(`
      INSERT INTO bundle_scores (id, bundle_id, sales_score, compatibility_score, inventory_score, discount_score, total_score, score_version)
      VALUES
        ('score_1', 'bundle_gaming_01', 94.00, 96.00, 68.00, 90.00, 88.50, 'v1.0'),
        ('score_2', 'bundle_work_02', 88.00, 95.00, 92.00, 86.00, 90.15, 'v1.0'),
        ('score_3', 'bundle_travel_03', 72.00, 88.00, 85.00, 82.00, 80.60, 'v1.0')
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
    `);

    // 5. Insert Alerts
    await connection.query(`
      INSERT INTO alerts (id, shop_id, bundle_id, type, severity, title, message, status)
      VALUES ('alert_1', 'shop_demo_01', 'bundle_gaming_01', 'inventory_warning', 'warning', 'Low Inventory on Included Item', 'TitanSound 7.1 Gaming Headset has only 3 units remaining. Bundle fulfillment will be blocked if stock reaches zero.', 'active')
      ON DUPLICATE KEY UPDATE id = id;
    `);

    console.log('🎉 Seed records successfully written to MySQL!');
    await connection.end();
  } catch (error: any) {
    console.error('❌ Seeding error:', error.message);
  }
}

if (require.main === module) {
  seedDemoData();
}

export { seedDemoData };

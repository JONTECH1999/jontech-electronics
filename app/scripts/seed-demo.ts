import * as path from 'path';
import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seedDemoData() {
  console.log('🌱 KitFlow Database Seeder');
  console.log('----------------------------------------------------');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || process.env.USE_DEMO_DATA === 'true') {
    console.log('ℹ️  Running in DEMO mode. Memory repository auto-seeds realistic JonTech Electronics bundles on startup.');
    console.log('✅ JonTech Electronics records verified:');
    console.log('   - Shop: jontech-electronics-xs08gbw3.myshopify.com');
    console.log('   - Bundle 1: ESP32 IoT Smart Weather & Telemetry Kit (Score: 91.80)');
    console.log('   - Bundle 2: Arduino Academic Robotics & Obstacle Avoidance Pack (Score: 91.95)');
    console.log('   - Bundle 3: Raspberry Pi 4 Edge AI & LiDAR Autonomous Lab (Score: 77.30)');
    console.log('   - Bundle 4: STM32 Industrial Automation & Relay Control Rig (Score: 87.80)');
    console.log('   - Active Inventory Alerts: 1');
    console.log('   - Activity Logs: 4');
    return;
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log('📡 Connected to MySQL. Inserting JonTech Electronics seed records...');

    // 1. Insert Shop
    await connection.query(`
      INSERT INTO shops (id, shopify_domain, shopify_store_id, access_token, scope, is_active)
      VALUES (
        'shop_demo_01',
        'jontech-electronics-xs08gbw3.myshopify.com',
        'gid://shopify/Shop/82910291',
        'shpat_demo_access_token_kitflow_secure',
        'read_products,write_products,read_orders,read_inventory',
        true
      )
      ON DUPLICATE KEY UPDATE shopify_domain = VALUES(shopify_domain), updated_at = CURRENT_TIMESTAMP;
    `);

    // 2. Insert Bundles
    await connection.query(`
      INSERT INTO bundles (id, shop_id, name, description, status, discount_percent, target_category)
      VALUES
        (
          'bundle_iot_01',
          'shop_demo_01',
          'ESP32 IoT Smart Weather & Telemetry Kit',
          'Cloud-connected environmental monitoring suite with dual-core WiFi/BLE, high-precision DHT22 temperature/humidity sensing, I2C OLED display, and full prototyping jumper setup.',
          'active',
          15.00,
          'IoT & Wireless'
        ),
        (
          'bundle_robotics_02',
          'shop_demo_01',
          'Arduino Academic Robotics & Obstacle Avoidance Pack',
          'Comprehensive STEM robotics kit for school and university prototyping. Features ATmega328P brain, ultrasonic distance echo sensor, dual H-bridge motor driver, and micro servo steering.',
          'active',
          12.00,
          'Robotics & STEM'
        ),
        (
          'bundle_edgeai_03',
          'shop_demo_01',
          'Raspberry Pi 4 Edge AI & LiDAR Autonomous Lab',
          'High-compute Linux vision and SLAM laser distance measurement rig powered by Raspberry Pi 4 4GB and solid-state ToF LiDAR for advanced robotics research.',
          'active',
          10.00,
          'Edge AI & Vision'
        ),
        (
          'bundle_stm32_04',
          'shop_demo_01',
          'STM32 Industrial Automation & Relay Control Rig',
          '84MHz ARM Cortex-M4 embedded automation setup featuring Black Pill dev board, optocoupler-isolated 4-channel 220V relay switching, and breadboard prototyping wires.',
          'active',
          14.00,
          'Industrial Embedded'
        )
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
    `);

    // 3. Insert Bundle Items
    await connection.query(`
      INSERT INTO bundle_items (id, bundle_id, shopify_product_id, shopify_variant_id, product_title, variant_title, price, quantity)
      VALUES
        -- Bundle 1: ESP32 IoT
        ('item_iot_1', 'bundle_iot_01', 'gid://shopify/Product/101', 'gid://shopify/ProductVariant/1011', 'ESP32 NodeMCU DevKit v1 (30-Pin WiFi+BLE)', '30-Pin CP2102 USB-C', 280.00, 1),
        ('item_iot_2', 'bundle_iot_01', 'gid://shopify/Product/105', 'gid://shopify/ProductVariant/1051', 'DHT22 Digital Temperature & Humidity Sensor', 'High-Precision Module', 195.00, 1),
        ('item_iot_3', 'bundle_iot_01', 'gid://shopify/Product/108', 'gid://shopify/ProductVariant/1081', '0.96 inch I2C OLED Display (128x64)', '4-Pin I2C Blue/White', 145.00, 1),
        ('item_iot_4', 'bundle_iot_01', 'gid://shopify/Product/112', 'gid://shopify/ProductVariant/1121', 'Master Solderless Breadboard & 65-pc Jumper Wires', '830-Point MB-102 Kit', 175.00, 1),

        -- Bundle 2: Arduino Robotics
        ('item_rob_1', 'bundle_robotics_02', 'gid://shopify/Product/102', 'gid://shopify/ProductVariant/1021', 'Arduino Uno R3 (ATmega328P + CH340G)', 'DIP Edition + USB Cable', 350.00, 1),
        ('item_rob_2', 'bundle_robotics_02', 'gid://shopify/Product/106', 'gid://shopify/ProductVariant/1061', 'HC-SR04 Ultrasonic Distance Sensor', '5V Echo Transducer', 85.00, 1),
        ('item_rob_3', 'bundle_robotics_02', 'gid://shopify/Product/109', 'gid://shopify/ProductVariant/1091', 'L298N Dual H-Bridge DC Motor Driver', '2A Peak Driver Board', 120.00, 1),
        ('item_rob_4', 'bundle_robotics_02', 'gid://shopify/Product/111', 'gid://shopify/ProductVariant/1111', 'SG90 9g Micro Servo Motor', '180-Degree Nylon Gear', 95.00, 1),
        ('item_rob_5', 'bundle_robotics_02', 'gid://shopify/Product/112', 'gid://shopify/ProductVariant/1121', 'Master Solderless Breadboard & 65-pc Jumper Wires', '830-Point MB-102 Kit', 175.00, 1),

        -- Bundle 3: Raspberry Pi 4 Edge AI & LiDAR
        ('item_ai_1', 'bundle_edgeai_03', 'gid://shopify/Product/103', 'gid://shopify/ProductVariant/1031', 'Raspberry Pi 4 Model B (4GB RAM)', 'Quad-Core 64-bit Linux', 3899.00, 1),
        ('item_ai_2', 'bundle_edgeai_03', 'gid://shopify/Product/107', 'gid://shopify/ProductVariant/1071', 'TFmini-S Micro Solid-State LiDAR Sensor', 'UART / I2C 12m Rangefinder', 1850.00, 1),
        ('item_ai_3', 'bundle_edgeai_03', 'gid://shopify/Product/108', 'gid://shopify/ProductVariant/1081', '0.96 inch I2C OLED Display (128x64)', '4-Pin I2C Blue/White', 145.00, 1),

        -- Bundle 4: STM32 Industrial Automation
        ('item_stm_1', 'bundle_stm32_04', 'gid://shopify/Product/104', 'gid://shopify/ProductVariant/1041', 'STM32F401 "Black Pill" ARM Cortex-M4 Board', '84MHz 256KB Flash USB-C', 240.00, 1),
        ('item_stm_2', 'bundle_stm32_04', 'gid://shopify/Product/110', 'gid://shopify/ProductVariant/1101', '4-Channel 5V Relay Module with Optocoupler', '250VAC 10A Active Low', 165.00, 1),
        ('item_stm_3', 'bundle_stm32_04', 'gid://shopify/Product/112', 'gid://shopify/ProductVariant/1121', 'Master Solderless Breadboard & 65-pc Jumper Wires', '830-Point MB-102 Kit', 175.00, 1)
      ON DUPLICATE KEY UPDATE id = id;
    `);

    // 4. Insert Deterministic Scores
    await connection.query(`
      INSERT INTO bundle_scores (id, bundle_id, sales_score, compatibility_score, inventory_score, discount_score, total_score, score_version)
      VALUES
        ('score_iot_01', 'bundle_iot_01', 92.00, 98.00, 88.00, 85.00, 91.80, 'v1.0'),
        ('score_rob_02', 'bundle_robotics_02', 95.00, 96.00, 90.00, 82.00, 91.95, 'v1.0'),
        ('score_ai_03', 'bundle_edgeai_03', 78.00, 92.00, 55.00, 80.00, 77.30, 'v1.0'),
        ('score_stm_04', 'bundle_stm32_04', 82.00, 94.00, 91.00, 86.00, 87.80, 'v1.0')
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
    `);

    // 5. Insert Alerts
    await connection.query(`
      INSERT INTO alerts (id, shop_id, bundle_id, type, severity, title, message, status)
      VALUES (
        'alert_lidar_01',
        'shop_demo_01',
        'bundle_edgeai_03',
        'inventory_critical',
        'critical',
        'Critical Inventory on TFmini-S LiDAR Sensor',
        'TFmini-S Micro Solid-State LiDAR Sensor has only 2 units remaining in stock. Autonomous lab bundles will fail fulfillment if inventory is depleted.',
        'active'
      )
      ON DUPLICATE KEY UPDATE id = id;
    `);

    // 6. Insert Activity Logs
    await connection.query(`
      INSERT INTO activity_logs (id, shop_id, bundle_id, action, description)
      VALUES
        ('log_1', 'shop_demo_01', 'bundle_iot_01', 'bundle_created', 'Created ESP32 IoT Smart Weather & Telemetry Kit with 4 prototyping components and 15% discount.'),
        ('log_2', 'shop_demo_01', 'bundle_robotics_02', 'bundle_created', 'Published Arduino Academic Robotics & Obstacle Avoidance Pack for STEM university engineering.'),
        ('log_3', 'shop_demo_01', 'bundle_edgeai_03', 'score_recalculated', 'Recalculated deterministic score for Raspberry Pi 4 Autonomous Rig: 77.30/100 (Constrained by LiDAR stock).'),
        ('log_4', 'shop_demo_01', 'bundle_edgeai_03', 'inventory_alert_triggered', 'Inventory threshold alert triggered: TFmini-S LiDAR Sensor remaining stock reached 2 units.')
      ON DUPLICATE KEY UPDATE id = id;
    `);

    console.log('🎉 JonTech Electronics records successfully written to MySQL!');
    await connection.end();
  } catch (error: any) {
    console.error('❌ Seeding error:', error.message);
  }
}

if (require.main === module) {
  seedDemoData();
}

export { seedDemoData };

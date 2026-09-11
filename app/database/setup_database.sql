-- ====================================================================
-- KitFlow Database Setup Script for MySQL 8.0+
-- File: app/database/setup_database.sql
-- Description: Creates the 'kitflow_db' database, all 7 normalized tables,
--              foreign keys, and initial seed data for JonTech Electronics.
-- ====================================================================

-- 1. Create and Select Database
CREATE DATABASE IF NOT EXISTS `kitflow_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `kitflow_db`;

-- 2. Create Table: shops (Multi-Tenant Isolated Merchants)
CREATE TABLE IF NOT EXISTS `shops` (
  `id` VARCHAR(36) NOT NULL,
  `shopify_domain` VARCHAR(255) NOT NULL,
  `shopify_store_id` VARCHAR(255) NULL,
  `access_token` TEXT NOT NULL,
  `scope` VARCHAR(500) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shops_shopify_domain_unique` (`shopify_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Table: bundles (Merchant Bundles & Setups)
CREATE TABLE IF NOT EXISTS `bundles` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('active', 'draft', 'archived') NOT NULL DEFAULT 'draft',
  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `target_category` VARCHAR(100) NOT NULL DEFAULT 'General',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bundles_shop_id_idx` (`shop_id`),
  CONSTRAINT `fk_bundles_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Table: bundle_items (Line Items within Bundles)
CREATE TABLE IF NOT EXISTS `bundle_items` (
  `id` VARCHAR(36) NOT NULL,
  `bundle_id` VARCHAR(36) NOT NULL,
  `shopify_product_id` VARCHAR(255) NOT NULL,
  `shopify_variant_id` VARCHAR(255) NULL,
  `product_title` VARCHAR(255) NOT NULL,
  `variant_title` VARCHAR(255) NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `quantity` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bundle_items_bundle_id_idx` (`bundle_id`),
  CONSTRAINT `fk_bundle_items_bundle` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create Table: bundle_scores (Deterministic 4-Factor Scoring Snapshots)
CREATE TABLE IF NOT EXISTS `bundle_scores` (
  `id` VARCHAR(36) NOT NULL,
  `bundle_id` VARCHAR(36) NOT NULL,
  `sales_score` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `compatibility_score` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `inventory_score` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `discount_score` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `total_score` DECIMAL(5,2) NOT NULL DEFAULT '0.00',
  `score_version` VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  `metrics_snapshot` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bundle_scores_bundle_id_unique` (`bundle_id`),
  CONSTRAINT `fk_bundle_scores_bundle` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create Table: ai_analyses (Anthropic Claude Advisory Analyses)
CREATE TABLE IF NOT EXISTS `ai_analyses` (
  `id` VARCHAR(36) NOT NULL,
  `bundle_id` VARCHAR(36) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `summary` TEXT NOT NULL,
  `strengths` JSON NOT NULL,
  `risks` JSON NOT NULL,
  `recommendations` JSON NOT NULL,
  `raw_response` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ai_analyses_bundle_id_idx` (`bundle_id`),
  CONSTRAINT `fk_ai_analyses_bundle` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create Table: activity_logs (Audit Trail for Merchant Actions)
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `bundle_id` VARCHAR(36) NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_logs_shop_id_idx` (`shop_id`),
  KEY `activity_logs_bundle_id_idx` (`bundle_id`),
  CONSTRAINT `fk_activity_logs_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_activity_logs_bundle` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create Table: alerts (Automated Inventory & Threshold Warnings)
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` VARCHAR(36) NOT NULL,
  `shop_id` VARCHAR(36) NOT NULL,
  `bundle_id` VARCHAR(36) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `severity` VARCHAR(20) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `alerts_shop_id_idx` (`shop_id`),
  KEY `alerts_bundle_id_idx` (`bundle_id`),
  CONSTRAINT `fk_alerts_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alerts_bundle` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- INITIAL SEED DATA (JonTech Electronics Maker & Prototyping Store)
-- ====================================================================

-- Seed 1: Authorize Demo Store
INSERT INTO `shops` (`id`, `shopify_domain`, `shopify_store_id`, `access_token`, `scope`, `is_active`)
VALUES (
  'shop_demo_01',
  'jontech-electronics.myshopify.com',
  'gid://shopify/Shop/82910291',
  'shpat_demo_access_token_kitflow_secure',
  'read_products,write_products,read_orders,read_inventory',
  TRUE
) ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Seed 2: Create Core Curated Bundles (Electronics & Prototyping)
INSERT INTO `bundles` (`id`, `shop_id`, `name`, `description`, `status`, `discount_percent`, `target_category`)
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
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Seed 3: Create Bundle Items (Sensors, MCUs, Modules)
INSERT INTO `bundle_items` (`id`, `bundle_id`, `shopify_product_id`, `shopify_variant_id`, `product_title`, `variant_title`, `price`, `quantity`)
VALUES
  -- Bundle 1: ESP32 IoT Weather Station
  ('item_iot_1', 'bundle_iot_01', 'gid://shopify/Product/101', 'gid://shopify/ProductVariant/1011', 'ESP32 NodeMCU DevKit v1 (30-Pin WiFi+BLE)', '30-Pin CP2102 USB-C', 280.00, 1),
  ('item_iot_2', 'bundle_iot_01', 'gid://shopify/Product/105', 'gid://shopify/ProductVariant/1051', 'DHT22 Digital Temperature & Humidity Sensor', 'High-Precision Module', 195.00, 1),
  ('item_iot_3', 'bundle_iot_01', 'gid://shopify/Product/108', 'gid://shopify/ProductVariant/1081', '0.96 inch I2C OLED Display (128x64)', '4-Pin I2C Blue/White', 145.00, 1),
  ('item_iot_4', 'bundle_iot_01', 'gid://shopify/Product/112', 'gid://shopify/ProductVariant/1121', 'Master Solderless Breadboard & 65-pc Jumper Wires', '830-Point MB-102 Kit', 175.00, 1),

  -- Bundle 2: Arduino School Robotics
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
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Seed 4: Create Deterministic Scores
INSERT INTO `bundle_scores` (`id`, `bundle_id`, `sales_score`, `compatibility_score`, `inventory_score`, `discount_score`, `total_score`, `score_version`, `metrics_snapshot`)
VALUES
  (
    'score_iot_01',
    'bundle_iot_01',
    92.00,
    98.00,
    88.00,
    85.00,
    91.80,
    'v1.0',
    JSON_OBJECT('coOrderFrequency', 42, 'velocity', 56, 'categorySynergy', 98, 'lowestStock', 38, 'discountPercent', 15)
  ),
  (
    'score_rob_02',
    'bundle_robotics_02',
    95.00,
    96.00,
    90.00,
    82.00,
    91.95,
    'v1.0',
    JSON_OBJECT('coOrderFrequency', 48, 'velocity', 62, 'categorySynergy', 96, 'lowestStock', 30, 'discountPercent', 12)
  ),
  (
    'score_ai_03',
    'bundle_edgeai_03',
    78.00,
    92.00,
    55.00,
    80.00,
    77.30,
    'v1.0',
    JSON_OBJECT('coOrderFrequency', 18, 'velocity', 22, 'categorySynergy', 92, 'lowestStock', 2, 'discountPercent', 10)
  ),
  (
    'score_stm_04',
    'bundle_stm32_04',
    82.00,
    94.00,
    91.00,
    86.00,
    87.80,
    'v1.0',
    JSON_OBJECT('coOrderFrequency', 24, 'velocity', 31, 'categorySynergy', 94, 'lowestStock', 25, 'discountPercent', 14)
  )
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Seed 5: Create Sample Active Alert (LiDAR Stock Warning)
INSERT INTO `alerts` (`id`, `shop_id`, `bundle_id`, `type`, `severity`, `title`, `message`, `status`)
VALUES (
  'alert_lidar_01',
  'shop_demo_01',
  'bundle_edgeai_03',
  'inventory_critical',
  'critical',
  'Critical Inventory on TFmini-S LiDAR Sensor',
  'TFmini-S Micro Solid-State LiDAR Sensor has only 2 units remaining in stock. Autonomous lab bundles will fail fulfillment if inventory is depleted.',
  'active'
) ON DUPLICATE KEY UPDATE `id` = `id`;

-- Seed 6: Create Sample Audit Log
INSERT INTO `activity_logs` (`id`, `shop_id`, `bundle_id`, `action`, `description`, `metadata`)
VALUES
  (
    'log_1',
    'shop_demo_01',
    'bundle_iot_01',
    'bundle_created',
    'Created ESP32 IoT Smart Weather & Telemetry Kit with 4 prototyping components and 15% discount.',
    JSON_OBJECT('author', 'Merchant Admin', 'source', 'KitFlow')
  ),
  (
    'log_2',
    'shop_demo_01',
    'bundle_robotics_02',
    'bundle_created',
    'Published Arduino Academic Robotics & Obstacle Avoidance Pack for STEM university engineering.',
    JSON_OBJECT('author', 'Merchant Admin', 'source', 'KitFlow')
  ),
  (
    'log_3',
    'shop_demo_01',
    'bundle_edgeai_03',
    'score_recalculated',
    'Recalculated deterministic score for Raspberry Pi 4 Autonomous Rig: 77.30/100 (Constrained by LiDAR stock).',
    JSON_OBJECT('previousScore', 82.0, 'newScore', 77.3, 'factors', JSON_OBJECT('sales', 78, 'compatibility', 92, 'inventory', 55, 'discount', 80))
  ),
  (
    'log_4',
    'shop_demo_01',
    'bundle_edgeai_03',
    'inventory_alert_triggered',
    'Inventory threshold alert triggered: TFmini-S LiDAR Sensor remaining stock reached 2 units.',
    JSON_OBJECT('severity', 'critical', 'stock', 2, 'source', 'KitFlow Watchdog')
  )
ON DUPLICATE KEY UPDATE `id` = `id`;


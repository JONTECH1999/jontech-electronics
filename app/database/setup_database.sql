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
-- INITIAL SEED DATA (JonTech Electronics Demo Store)
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

-- Seed 2: Create Core Curated Bundles
INSERT INTO `bundles` (`id`, `shop_id`, `name`, `description`, `status`, `discount_percent`, `target_category`)
VALUES
  (
    'bundle_gaming_01',
    'shop_demo_01',
    'Gaming Battlestation Starter Pack',
    'Competitive esports setup calibrated for fast-paced shooters with 8K polling and mechanical switches.',
    'active',
    12.00,
    'Gaming'
  ),
  (
    'bundle_work_02',
    'shop_demo_01',
    'Work From Home Ergonomic Studio',
    'Orthopedic workstation suite designed for programmers and creators working 8+ hour screen sessions.',
    'active',
    14.00,
    'Work'
  ),
  (
    'bundle_travel_03',
    'shop_demo_01',
    'Nomad Road Warrior Travel Tech Kit',
    'Ultra-lightweight peripherals and 65W GaN charging engineered for airport lounges and coffee shop sprints.',
    'active',
    10.00,
    'Travel'
  )
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Seed 3: Create Bundle Items
INSERT INTO `bundle_items` (`id`, `bundle_id`, `shopify_product_id`, `shopify_variant_id`, `product_title`, `variant_title`, `price`, `quantity`)
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
ON DUPLICATE KEY UPDATE `id` = `id`;

-- Seed 4: Create Deterministic Scores
INSERT INTO `bundle_scores` (`id`, `bundle_id`, `sales_score`, `compatibility_score`, `inventory_score`, `discount_score`, `total_score`, `score_version`, `metrics_snapshot`)
VALUES
  (
    'score_1',
    'bundle_gaming_01',
    94.00,
    96.00,
    68.00,
    90.00,
    88.50,
    'v1.0',
    JSON_OBJECT('coOrderFrequency', 28, 'velocity', 45, 'categorySynergy', 96, 'lowestStock', 3, 'discountPercent', 12)
  ),
  (
    'score_2',
    'bundle_work_02',
    88.00,
    95.00,
    92.00,
    86.00,
    90.15,
    'v1.0',
    JSON_OBJECT('coOrderFrequency', 22, 'velocity', 38, 'categorySynergy', 95, 'lowestStock', 11, 'discountPercent', 14)
  ),
  (
    'score_3',
    'bundle_travel_03',
    72.00,
    88.00,
    85.00,
    82.00,
    80.60,
    'v1.0',
    JSON_OBJECT('coOrderFrequency', 14, 'velocity', 26, 'categorySynergy', 88, 'lowestStock', 19, 'discountPercent', 10)
  )
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Seed 5: Create Sample Active Alert
INSERT INTO `alerts` (`id`, `shop_id`, `bundle_id`, `type`, `severity`, `title`, `message`, `status`)
VALUES (
  'alert_1',
  'shop_demo_01',
  'bundle_gaming_01',
  'inventory_warning',
  'warning',
  'Low Inventory on Included Item',
  'TitanSound 7.1 Gaming Headset has only 3 units remaining. Bundle fulfillment will be blocked if stock reaches zero.',
  'active'
) ON DUPLICATE KEY UPDATE `id` = `id`;

-- Seed 6: Create Sample Audit Log
INSERT INTO `activity_logs` (`id`, `shop_id`, `bundle_id`, `action`, `description`, `metadata`)
VALUES (
  'log_1',
  'shop_demo_01',
  'bundle_gaming_01',
  'bundle_created',
  'Created Gaming Battlestation Starter Pack with 4 products and 12% discount.',
  JSON_OBJECT('author', 'Merchant Admin', 'source', 'KitFlow')
) ON DUPLICATE KEY UPDATE `id` = `id`;

-- KitFlow MySQL Database Migration
-- Version: 0000_init
-- Description: Initial database schema with multi-tenant shops, bundles, scoring, AI analyses, alerts, and audit logs.

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

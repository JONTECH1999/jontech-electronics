# KitFlow & JonTech Electronics — Architectural Decisions & Design Document

This document details the architectural, engineering, database, and product design decisions implemented across **KitFlow** (the embedded Shopify merchant app) and **JonTech Electronics** (the custom Online Store 2.0 storefront theme).

---

## 1. Store Concept: JonTech Electronics

### Brand Identity & Target Market
**JonTech Electronics** is a modern, premium, technical, and approachable brand specializing in curated technology setups for:
1. **Competitive Gaming**: Esports setups featuring optical high-polling mice, rapid-trigger magnetic Hall effect keyboards, and spatial audio headsets.
2. **Productivity & Work**: Ergonomic multi-device split workstations engineered for software engineers, digital creators, and remote managers.
3. **Study & Campus**: Quiet, portable multi-OS essentials engineered for lecture halls and libraries.
4. **Travel & Road Warrior**: Ultra-compact folding peripherals, GaN multi-port fast chargers, and deep cabin noise-cancelling headphones.

### Aesthetics & Philosophy
The storefront eschews generic e-commerce clutter, loud gradients, and fake enterprise branding. Instead, it utilizes:
- High-contrast, dark-mode technical styling (Deep Slate `#0B0F17`, Surface `#131B2A`, Electric Cyan `#00E5FF`, and Emerald `#10B981`).
- Semantic Online Store 2.0 Liquid architecture with reusable sections and JSON templates.
- Minimal, lightning-fast vanilla JavaScript without monolithic UI framework overhead.

---

## 2. App Idea: KitFlow

**KitFlow** is an embedded Shopify Admin application designed to empower merchants to create, evaluate, rank, monitor, and optimize curated product bundles.

Instead of treating product bundling as a simple "buy X get Y" discount tool, KitFlow approaches bundles as strategic merchandising assets that directly dictate:
- **Average Order Value (AOV)**
- **Warehouse Inventory Velocity**
- **Catalog Cross-Sell Affinity**
- **Customer Setup Satisfaction**

---

## 3. The Merchant Problem

Shopify merchants frequently encounter 4 major obstacles when scaling bundle offers:
1. **Lack of Objective Validation**: Merchants guess which items to bundle together based on intuition rather than historical co-order affinity and functional compatibility.
2. **Opaque Performance Tracking**: Standard Shopify reports aggregate sales by individual SKU or line item, making it difficult to assess how cohesive setups perform over time.
3. **Catastrophic Inventory Bottlenecks**: A single out-of-stock item in a 4-item bundle prevents the entire bundle from being fulfilled. Merchants rarely discover this until orders are backlogged.
4. **Margin Erosion from Over-Discounting**: Merchants frequently over-discount high-demand items or under-discount slow-moving inventory, undermining gross margins.

---

## 4. Product Thinking: Why Scoring, Ranking, Alerts & AI?

KitFlow addresses these merchant friction points through a four-tier architecture:

| Tier | Component | Merchant Value |
| :--- | :--- | :--- |
| **Tier 1** | **Deterministic Scoring (0–100)** | Provides an objective, reproducible benchmark evaluating sales momentum, hardware synergy, inventory safety, and margin efficiency. |
| **Tier 2** | **Algorithmic Ranking** | Instantly surfaces top-performing flagship setups versus underperforming packages needing intervention. |
| **Tier 3** | **Automated Inventory Alerts** | Continuously evaluates stock thresholds ($\le 2$ Critical, $\le 5$ Warning) to eliminate stockout surprises before they disrupt order fulfillment. |
| **Tier 4** | **AI Strategic Analyst** | Leverages Anthropic Claude to translate complex telemetry into plain-English strategic action plans without hallucinating or overriding business rules. |

---

## 5. Architecture Decisions

### Monorepo Separation
```text
kitflow/
├── theme/   # Customer-facing storefront experience (Shopify OS 2.0, Liquid, CSS, Vanilla JS)
└── app/     # Merchant-facing embedded experience (Vite, React, Node.js, Drizzle, MySQL, Claude)
```
- **Theme Layer (`theme/`)**: Independent of any external node process; uploads directly to Shopify. Works seamlessly via Shopify's native liquid render engine and standard AJAX Cart API (`/cart/add.js`).
- **App Layer (`app/`)**: Embedded inside Shopify Admin via App Bridge iframe. Decoupled into `backend/` and `frontend/` to allow independent scaling, continuous integration, and headless deployment.

### Technology Choices
- **Frontend**: **Vite + React 18 + TypeScript**. Fast HMR during development, tiny production bundle ($< 250\text{ kB}$ gzip), and responsive dark UI inspired by Shopify Polaris design tokens.
- **Backend**: **Node.js + Express + TypeScript**. Lightweight, asynchronous event loop ideal for handling webhook fan-out, GraphQL batching, and concurrent merchant requests.
- **Database & ORM**: **MySQL + Drizzle ORM**. Relational schema with strict foreign keys and index constraints. Drizzle provides compile-time type safety, zero runtime overhead, and explicit, version-controlled SQL migrations.
- **Shopify API**: **Shopify Admin GraphQL API (version 2026-07)**. Eliminates over-fetching compared to REST and allows batching product variants, pricing, and order line items in single network round-trips. Dynamically configurable via `SHOPIFY_API_VERSION` in environment variables.
- **AI Engine**: **Anthropic TypeScript SDK (`@anthropic-ai/sdk`)**. Uses Claude (`claude-3-7-sonnet-latest`, configurable via `ANTHROPIC_MODEL`) for deep analytical reasoning and structured JSON output, with resilient fallback heuristics if offline.

---

## 6. Database Decisions & Multi-Tenant Schema

The database strictly enforces relational integrity and multi-tenant shop isolation across 7 normalized tables:

```text
shops
  │
  ├──► bundles
  │       │
  │       ├──► bundle_items
  │       ├──► bundle_scores
  │       └──► ai_analyses
  │
  ├──► activity_logs
  └──► alerts
```

### Table Breakdown
1. **`shops`**: Stores authorized merchant stores (`id`, `shopify_domain`, `access_token`, `scope`, `is_active`, `timestamps`).
2. **`bundles`**: Parent record for merchant bundles (`id`, `shop_id` FK, `name`, `description`, `status`, `discount_percent`, `target_category`).
3. **`bundle_items`**: Child line items (`id`, `bundle_id` FK, `shopify_product_id`, `shopify_variant_id`, `product_title`, `price`, `quantity`).
4. **`bundle_scores`**: Deterministic scoring snapshot (`id`, `bundle_id` FK UNIQUE, `sales_score`, `compatibility_score`, `inventory_score`, `discount_score`, `total_score`, `score_version`, `metrics_snapshot` JSON).
5. **`ai_analyses`**: Historical Claude strategic analyses (`id`, `bundle_id` FK, `model`, `summary`, `strengths` JSON, `risks` JSON, `recommendations` JSON, `raw_response`).
6. **`activity_logs`**: Append-only audit trail (`id`, `shop_id` FK, `bundle_id` FK nullable, `action`, `description`, `metadata` JSON).
7. **`alerts`**: Active and resolved risk alerts (`id`, `shop_id` FK, `bundle_id` FK, `type`, `severity`, `title`, `message`, `status`, `resolved_at`).

### Multi-Tenant Data Isolation
- **Cardinal Rule**: Every query on `bundles`, `activity_logs`, and `alerts` MUST include a `WHERE shop_id = ?` clause derived from the authenticated session context.
- Verified in `app/tests/integration/shop-isolation.test.ts`: Shop A cannot read, update, or delete Shop B's records under any circumstances.

---

## 7. Authentication & OAuth Hardening

KitFlow implements the official Shopify Embedded App OAuth 2.0 authorization code grant model:

1. **Domain Validation**: Incoming `shop` parameters are validated against strict Shopify domain regex (`/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/`) to eliminate SSRF and open redirect vulnerabilities.
2. **Cryptographic State Nonce (Anti-CSRF)**: During `/auth?shop=...`, the backend generates a 128-bit cryptographically secure random nonce (`crypto.randomBytes(16).toString('hex')`) with a 10-minute TTL. This nonce is verified and immediately invalidated upon callback to prevent CSRF and replay attacks.
3. **Cryptographic HMAC SHA-256 Verification**:
   - The query parameters returned by Shopify on `/auth/callback` are stripped of `hmac` and `signature`.
   - The remaining keys are sorted lexicographically, serialized as `key=value` pairs joined by `&`, and hashed via SHA-256 HMAC using the merchant app's `SHOPIFY_API_SECRET`.
   - The computed hash is compared against Shopify's `hmac` parameter using `crypto.timingSafeEqual` to guard against side-channel timing attacks.
4. **Token Exchange**: The backend exchanges the temporary authorization `code` with Shopify via `POST https://{shop}/admin/oauth/access_token` for an offline access token (`shpat_...`), provisioning or updating the store record in MySQL.
5. **App Bridge Embedded Redirection**: The controller preserves the base64-encoded `host` query parameter returned by Shopify and redirects to `/app?shop={shop}&host={host}`, enabling App Bridge to initialize seamlessly inside the Shopify Admin iframe without frame-ancestors violations.
6. **Transparent Demo Bypass**: For local evaluation without a live store, setting `USE_DEMO_DATA=true` enables instant testing with the pre-seeded demo store (`jontech-electronics.myshopify.com`).

---

## 8. Demo Simulation vs. Live Shopify Store Transparency

To eliminate ambiguity for merchants and evaluators:
- **Navigation Status Badge**: The embedded app sidebar displays a distinct status pill on every view:
  - `[DEMO DATA - Local Simulation]` (Amber): Clearly indicates simulated catalog and order velocity.
  - `[LIVE SHOPIFY GRAPHQL - 2026-07]` (Emerald): Explicitly confirms live Admin API connection.
- **Dashboard Banner**: Prominently informs the user of active mode, connected store domain, and Shopify API version.
- **Catalog Modal Badge**: The product selector identifies whether items originate from the local demonstration catalog or live GraphQL product queries.
- **Zero Deceptive Faking**: Error states and API fallbacks are logged and communicated transparently.

---

## 9. Storefront Theme & Real Shopify AJAX Cart API Batching

The JonTech Electronics "Build My Setup" interactive quiz (`theme/assets/tech-finder.js`) communicates directly with Shopify's native Cart API:
1. **Batch Submission**: When a customer clicks "Add Complete Setup to Cart", the theme sends a real batch request to `POST /cart/add.js`:
   ```json
   {
     "items": [
       {
         "id": 40000000000000,
         "quantity": 1,
         "properties": {
           "_bundle_name": "Apex Battlestation Gaming Bundle",
           "_bundle_category": "Gaming",
           "_bundle_discount": "12%",
           "_bundle_role": "Precision Aiming"
         }
       }
     ]
   }
   ```
2. **Dynamic Cart Count Synchronization**: Upon successful addition, the theme queries `GET /cart.js` to update all header cart counter bubbles (`[data-cart-count]`) dynamically in the DOM before redirecting to `/cart`.
3. **Graceful Standalone Fallback**: In standalone theme preview mode where the merchant has not yet seeded matching variant IDs in their dev store, the theme logs a clear notification and falls back gracefully to preview demonstration.

---

## 8. Deterministic Scoring Logic: Mathematical Specification

The numeric bundle score is **100% deterministic** and never generated by AI. This ensures total auditability, zero stochastic drift, and consistent business logic.

### Formula
$$\text{Total Score} = 0.35 \times S_{\text{sales}} + 0.25 \times C_{\text{compat}} + 0.20 \times I_{\text{inv}} + 0.20 \times D_{\text{disc}}$$

All sub-scores are normalized between $0$ and $100$:

### 1. Sales Performance ($S_{\text{sales}}$, Weight: 35%)
Evaluates historical co-order affinity and item velocity:
$$S_{\text{sales}} = \min\left(100, \max\left(20, \left(\frac{\text{Co-Orders}}{\max(1, \text{Total Orders})} \times 150\right) \times 0.6 + \text{Velocity Factor}\right)\right)$$
- Protects against division by zero when order volume is zero (assigns a neutral baseline of 65).

### 2. Product Compatibility ($C_{\text{compat}}$, Weight: 25%)
Evaluates functional diversity and category focus:
- Bundles combining complementary categories (e.g. Mouse + Keyboard + Headset + Desk Mat) receive high synergy scores ($90 - 100$).
- Bundles containing single items or redundant duplicates receive lower synergy scores ($45 - 50$).

### 3. Inventory Health ($I_{\text{inv}}$, Weight: 20%)
Protects the merchant against promoting bundles with stockout vulnerabilities:
- $\text{Stock} \le 0$: Score drops to $15$ (Critical Stockout).
- $\text{Stock} \le 2$: Score penalized to $25 - 45$ (Immediate Risk).
- $\text{Stock} \le 5$: Score penalized to $50 - 68$ (Warning Level).
- $\text{Stock} > 10$: Healthy score ($85 - 100$).

### 4. Discount Efficiency ($D_{\text{disc}}$, Weight: 20%)
Evaluates the commercial incentive sweet spot:
- $0\%$: Score $= 50$ (no incentive for the customer).
- $1\% - 7\%$: Score $= 65 - 80$ (weak incentive).
- $8\% - 15\%$: Score $= 100$ (optimal sweet spot: converts strongly without destroying gross margin).
- $16\% - 25\%$: Score $= 88$.
- $> 35\%$: Score penalized down to $30$ (excessive discount that risks merchant profitability).

---

## 9. AI Design & System Boundaries

### Why Anthropic Claude is Strictly Server-Side
- **Credential Security**: The `ANTHROPIC_API_KEY` never touches client-side bundles or browser network traffic.
- **Payload Pre-Processing**: The server aggregates telemetry (product prices, exact stock numbers, deterministic factor breakdowns, and active alerts) into a grounded prompt before calling Claude.

### Why AI Does Not Control Deterministic Scoring
1. **Auditability**: Merchants need to know exactly *why* a score is 88/100 without hallucinations.
2. **Cost Efficiency**: Scoring runs on every bundle edit, item quantity change, and inventory update. Running AI on every micro-edit would lead to excessive token costs.
3. **Latency**: Deterministic scoring computes in $< 2\text{ ms}$; LLM calls take $1.5 - 3.5\text{ s}$.
4. **Reliability**: If the Anthropic API is temporarily unreachable, the merchant's bundles, scores, rankings, and alerts remain 100% operational.

---

## 10. Tradeoffs & Engineering Decisions

1. **In-Memory Store vs External DB Container for Development**:
   - *Tradeoff*: Setting up a live local MySQL instance can be burdensome for take-home evaluators.
   - *Decision*: Implemented dual-mode repository in `db/index.ts`. When `USE_DEMO_DATA=true` or MySQL is absent, an in-memory transactional store activates automatically. When `DATABASE_URL` is set and `USE_DEMO_DATA=false`, full Drizzle MySQL queries execute.
2. **Polling vs Webhooks for Inventory Telemetry**:
   - *Tradeoff*: Shopify inventory webhooks require an open public tunnel (ngrok) and webhook registration.
   - *Decision*: Inventory is checked deterministically on-demand and cached during scoring runs, with webhook ingestion structure ready for production deployment.
3. **Zero-Dependency Storefront "Build My Setup" Quiz**:
   - *Tradeoff*: Could have called an external API or app proxy.
   - *Decision*: Built as a pure vanilla JavaScript matching matrix (`theme/assets/tech-finder.js`). This ensures zero network latency, 100% storefront uptime, and immediate checkout compatibility.

---

## 11. Failure Handling Matrix

| Component Failure | Consequence | KitFlow Recovery / Fallback Behavior |
| :--- | :--- | :--- |
| **Shopify API Unavailable** | Real-time catalog queries fail | Falls back to cached database catalog; displays safe merchant warning banner without halting app navigation. |
| **MySQL Database Offline** | Persistent database writes fail | Falls back to in-memory mock repository; logs clear warning in server console. |
| **Anthropic API Fails / Key Missing** | AI analysis unavailable | Deterministic scores, rankings, and alerts remain 100% intact. Returns clear HTTP 503 with user-friendly fallback explanation. |
| **Malformed AI Response** | Claude outputs invalid JSON | Schema validator catches malformed payload before saving, rejects record, and logs error without crashing backend. |

---

## 12. What I Would Improve With More Time

1. **Shopify App Proxy Integration**: Embed KitFlow bundle recommendation widgets directly on the online storefront PDPs via an authenticated App Proxy.
2. **Automated Bundle A/B Testing**: Run automated split tests comparing 10% vs 15% discount tiers to measure conversion elasticity.
3. **Automated Inventory Sync Webhooks**: Listen to `inventory_levels/update` and `orders/create` Shopify webhooks to continuously recalculate scores in a background worker queue (e.g. BullMQ / Redis).
4. **Multi-Location Inventory Allocation**: Support multi-warehouse routing for merchants fulfilling from multiple fulfillment centers.

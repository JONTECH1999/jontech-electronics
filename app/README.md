# KitFlow — Embedded Shopify Merchant Application

KitFlow is a portfolio-grade Shopify embedded merchant application designed to help merchants create, evaluate, rank, and improve high-converting product bundles.

---

## 1. Product Overview & Problem Solved

### The Merchant Problem
Shopify merchants frequently struggle with bundle strategy:
- Which products should be bundled together to maximize Average Order Value (AOV)?
- Which bundles are actual top performers versus low-margin drags?
- Which bundles have hidden inventory risks where a single stockout halts fulfillment?
- When and how should merchants adjust bundle pricing and promotions?

### KitFlow's Solution
KitFlow solves this by pairing:
1. **Shopify Telemetry**: Real-time product catalog, variant prices, inventory levels, and order history via the Shopify Admin GraphQL API.
2. **Deterministic Scoring Engine**: A mathematically grounded 4-factor scoring model (35% Sales, 25% Compatibility, 20% Inventory, 20% Discount) that provides reliable numeric rankings.
3. **Automated Inventory Alerts**: Deterministic threshold monitoring (Stock $\le 2$ Critical, Stock $\le 5$ Warning) to eliminate fulfillment risks.
4. **Merchant Activity Audit Trail**: Full timeline of creations, edits, score recalculations, and alert triages.
5. **AI Bundle Analyst (Anthropic Claude)**: A strategic advisory layer using Claude 3.5 Sonnet to explain scores, identify risks, and suggest merchant actions without controlling core business logic.

---

## 2. Architecture & Data Flow

```text
Shopify Admin
     │ (App Bridge / Embedded Iframe)
     ▼
Vite + React Frontend (TypeScript)
     │ (Authenticated JSON REST API / JWT Session)
     ▼
Node.js + Express Backend (TypeScript)
     │
     ├──► Shopify Admin GraphQL API (Products, Orders, Inventory)
     │
     ├──► Deterministic Scoring Engine (Zero-Division Safe Math)
     │
     ├──► Anthropic Claude SDK (Server-Side Strategic Analysis)
     │
     └──► Drizzle ORM ──► MySQL (Multi-Tenant Isolated DB)
```

---

## 3. Prerequisites

- **Node.js**: `v18.x` or higher (tested on Node `v24.x`)
- **npm**: `v9.x` or higher
- **MySQL**: `v8.0+` (optional in development; an in-memory transactional fallback is included when `USE_DEMO_DATA=true`)
- **Shopify Partner Account & Dev Store** (optional for local testing; simulated in demo mode)
- **Anthropic API Key** (optional for live Claude calls; simulated response fallback included)

---

## 4. Environment Variables (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `APP_URL` | Base application URL | `http://localhost:3000` |
| `SHOPIFY_API_KEY` | Shopify Client ID from Partner Dashboard | `shpat_xxxxxxxxxxxx` |
| `SHOPIFY_API_SECRET`| Shopify Client Secret | `shpss_xxxxxxxxxxxx` |
| `SHOPIFY_APP_URL` | Public tunnel URL (e.g. ngrok / cloudflare) | `https://xxxx.ngrok-free.app` |
| `SHOPIFY_API_VERSION` | Supported Shopify Admin GraphQL API version | `2026-07` |
| `SHOPIFY_SCOPES` | Required Admin API scopes | `read_products,write_products,read_orders,read_inventory` |
| `DATABASE_URL` | MySQL connection string | `mysql://root:password@127.0.0.1:3306/kitflow_db` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key (server-side only) | `sk-ant-api03-...` |
| `ANTHROPIC_MODEL` | Claude model identifier | `claude-3-7-sonnet-latest` |
| `USE_DEMO_DATA` | Enables offline demo data with memory store | `true` |
| `DEMO_SHOP_DOMAIN` | Fallback Shopify store domain | `jontech-electronics.myshopify.com` |

> [!IMPORTANT]
> Never commit `.env` to version control. The Anthropic API key and Shopify secrets are strictly server-side and never exposed to the Vite frontend.

---

## 5. Database Setup & Migrations

KitFlow uses **Drizzle ORM** with MySQL.

### Generate & Run Migrations
```bash
# Generate SQL migrations from schema
npm run db:generate

# Execute migrations against MySQL
npm run db:migrate

# Seed realistic demo bundle data (Gaming, Work, Travel kits)
npm run seed
```

---

## 6. Running Locally

### Start Backend & Frontend Concurrently
```bash
# Inside /app:
npm run dev

# Or run separately:
npm run dev:backend   # Starts Express API on port 3000
npm run dev:frontend  # Starts Vite Dev Server on port 5173
```

Open your browser at `http://localhost:5173/app` to access the KitFlow merchant dashboard.

---

## 7. Running Tests

KitFlow includes a comprehensive Vitest suite (7 test suites, 37 passing tests) verifying the scoring engine, ranking logic, validation schemas, alert thresholds, shop isolation, cryptographic OAuth verification, and AI error resilience.

```bash
# Run all unit and integration tests
npm test
```

### Test Coverage Highlights:
- **`scoring.test.ts`**: High/low volume co-orders, zero-division protection, missing data normalization, weight distributions.
- **`ranking.test.ts`**: Strict descending order sort, score ties, empty lists, rank number assignment.
- **`validation.test.ts`**: Name validation, minimum 1 item, quantity boundaries, discount limits ($0\% - 75\%$).
- **`inventory-alerts.test.ts`**: Critical ($\le 2$) and warning ($\le 5$) threshold triggers.
- **`oauth-verification.test.ts`**: Cryptographic HMAC SHA-256 verification (timing-safe comparison), anti-CSRF state nonces, and strict domain validation.
- **`shop-isolation.test.ts`**: Strict multi-tenant isolation ensuring Shop A cannot read, update, or delete Shop B's bundles.
- **`ai-validation.test.ts`**: Schema adherence, missing keys rejection, and graceful offline fallback.

---

## 8. Directory Structure

```text
app/
├── backend/
│   ├── src/
│   │   ├── config/          # Zod environment validation
│   │   ├── controllers/     # REST controllers (auth, dashboard, bundles, alerts, activity, settings)
│   │   ├── db/              # Drizzle connection & multi-tenant repository
│   │   ├── middleware/      # Shopify auth, validation, and error middleware
│   │   ├── routes/          # Express route definitions
│   │   ├── services/
│   │   │   ├── ai/          # Anthropic Claude SDK client & prompt builder
│   │   │   ├── alerts/      # Deterministic inventory alert engine
│   │   │   ├── bundles/     # Bundle CRUD & scoring lifecycle
│   │   │   ├── scoring/     # 4-factor deterministic scoring formulas
│   │   │   └── shopify/     # GraphQL API client for products, orders, inventory
│   │   ├── validators/      # Zod schemas for bundle requests
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── app.ts           # Express application setup
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # ScoreBadge, StatusBadge, KpiCard, ScoreBreakdown, AlertBanner, Modal
│   │   ├── pages/           # Dashboard, Bundles, BundleDetail, BundleForm, Activity, Alerts, Settings
│   │   ├── services/        # Frontend API client
│   │   ├── styles/          # Dark Polaris-inspired CSS design system
│   │   ├── types/           # TypeScript UI types
│   │   ├── App.tsx          # Router layout & navigation
│   │   └── main.tsx         # React root
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── database/
│   ├── migrations/          # 0000_init.sql Drizzle migration file
│   ├── schema/              # Table schemas: shops, bundles, bundle_items, scores, ai, logs, alerts
│   ├── drizzle.config.ts    # Drizzle Kit MySQL config
│   └── migrate.ts           # Database migration runner
│
├── tests/
│   ├── unit/                # Scoring, ranking, validation, inventory, AI schema tests
│   └── integration/         # Multi-tenant shop data isolation tests
│
├── scripts/
│   └── seed-demo.ts         # Realistic electronics bundle seeder
├── .env.example
├── package.json
└── README.md
```

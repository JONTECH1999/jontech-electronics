# KitFlow & JonTech Electronics

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Shopify Online Store 2.0](https://img.shields.io/badge/Shopify-Online_Store_2.0-95BF47.svg)](https://shopify.dev/docs/themes)
[![Shopify API](https://img.shields.io/badge/Shopify_API-2026--07-7AB55C.svg)](https://shopify.dev/docs/api/admin-graphql)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F.svg)](https://orm.drizzle.team/)
[![Anthropic Claude](https://img.shields.io/badge/AI-Claude_3.7_Sonnet-D97706.svg)](https://www.anthropic.com/)
[![Vitest](https://img.shields.io/badge/Tests-37_Passing-brightgreen.svg)](https://vitest.dev/)

A portfolio-quality Shopify take-home submission demonstrating:
1. **Part 1 — Shopify Storefront Theme**: **JonTech Electronics** (Online Store 2.0 theme built with Liquid, CSS, minimal vanilla JavaScript, and the standout interactive feature "Build My Setup" with real Shopify AJAX Cart API batch integration).
2. **Part 2 — Embedded Shopify App**: **KitFlow** (Merchant admin application built with Vite, React, Node.js, TypeScript, MySQL, Drizzle ORM, cryptographic OAuth HMAC SHA-256 verification, deterministic scoring, automated inventory alerts, and Anthropic Claude AI analysis).

---

## Repository Structure

```text
Shopify Store/
│
├── theme/                     # PART 1: Custom Shopify Storefront Theme
│   ├── assets/                # base.css, theme.js, tech-finder.js
│   ├── config/                # settings_schema.json, settings_data.json
│   ├── layout/                # theme.liquid master layout
│   ├── locales/               # en.default.json
│   ├── sections/              # header, footer, hero, products, categories, tech-finder, etc.
│   ├── snippets/              # product-card, price, badge, icon
│   └── templates/             # index.json, collection.json, product.json, cart.json, 404.json
│
├── app/                       # PART 2: Embedded Shopify Merchant App
│   ├── backend/               # Node.js + Express + TypeScript service layer
│   ├── frontend/              # Vite + React 18 + TypeScript admin dashboard
│   ├── database/              # Drizzle ORM schema, migrations, and migration runner
│   ├── tests/                 # Unit & integration test suites (Vitest)
│   ├── scripts/               # Realistic electronics demo data seeder
│   ├── .env.example           # Environment template
│   ├── package.json           # App workspace scripts
│   └── README.md              # Detailed app setup guide
│
├── APP_DECISIONS.md           # In-depth architectural decision log & engineering rationale
├── IMPLEMENTATION_CHECKLIST.md# Requirement-by-requirement audit matrix
├── README.md                  # This root document
└── .gitignore                 # Safe git ignore rules
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.x` or higher (tested on `v24.20.0`)
- **npm**: `v9.x` or higher
- **Git**

### 2. Installation
Install all dependencies across backend and frontend in one command:

```bash
# Install backend dependencies
cd app/backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Run Automated Tests
Execute the 37 automated tests verifying deterministic scoring formulas, ranking algorithms, input validation, inventory alert thresholds, cryptographic OAuth HMAC SHA-256 signatures, state nonces, shop isolation, and AI schema resilience:

```bash
# Inside app/backend:
npm test
```

Expected output:
```text
Test Files  7 passed (7)
     Tests  37 passed (37)
```

### 4. Run the Application in VS Code

#### Option A: One Command (Recommended)
Open a terminal in the root project folder (`Shopify Store`):
```bash
npm run dev
```
> This uses `concurrently` to start **both** the Backend (`http://localhost:3000`) and the Frontend (`http://localhost:5173/app`) at the same time with color-coded logs.

**To STOP running:**
- Press `Ctrl + C` in the terminal (and type `Y` if prompted). Both servers will shut down together cleanly.

---

#### Option B: Two Separate Terminals
If you prefer dedicated terminal tabs:
```bash
# Terminal 1 — Backend:
npm run dev:backend
# Or: cd app/backend && npm run dev

# Terminal 2 — Frontend:
npm run dev:frontend
# Or: cd app/frontend && npm run dev
```

**To STOP running:**
- In each terminal tab, press `Ctrl + C` or click the trash can icon (Kill Terminal).

---

#### Option C: VS Code Task Menu
Press `Ctrl + Shift + P` (or go to **Terminal** -> **Run Task...**), select:
`Start JonTech App (Backend + Frontend)`


Open `http://localhost:5173/app` in your browser. You can immediately inspect:
- **Dashboard**: KPI cards, top bundles ranking, active alerts, recent activity timeline, and AI insights.
- **Bundle List & Details**: Inspect the *Gaming Battlestation Starter Pack* (Score: 88.50/100), view its 4-factor scoring breakdown, and click **"Analyze with AI"** to trigger Claude analysis.
- **Create & Edit Workflows**: Build new bundles using the integrated Shopify product selector with live inventory counts.
- **Alerts Triage**: Resolve inventory alerts or view affected setups.
- **Engine Settings**: Calibrate factor weights and alert sensitivity thresholds.

---

## Part 1 — Custom Shopify Storefront Theme (JonTech Electronics)

### Theme Highlights
- **Brand Personality**: Modern, clean, technical, trustworthy, approachable.
- **Zero Heavy Frameworks**: Pure Shopify Liquid + CSS + minimal vanilla JavaScript.
- **Online Store 2.0 Compliant**: Modular sections, customizable schemas, and JSON templates.
- **Standout Interactive Feature — "Build My Setup"**:
  - Located on the homepage (`#build-my-setup`).
  - Asks 3 questions: Category (Gaming, Work, Study, Travel), Budget (Under ₱5,000, ₱5,000–₱15,000, ₱15,000+), and Priority (Performance, Portability, Comfort, Value).
  - Matches the ideal curated gear package with real calculated itemized pricing, verified bundle discounts, and instant single-click cart addition.
  - **Zero external network dependency**: Runs 100% reliably in client-side vanilla JavaScript.

### How to Install & Preview the Theme

#### Option A: Using Shopify CLI
```bash
cd theme
shopify theme dev --store your-store.myshopify.com
```

#### Option B: Uploading to Shopify Admin
1. Compress the contents of the `theme/` directory into a `.zip` file (ensure `layout/`, `sections/`, `templates/`, `assets/`, `config/`, and `locales/` are at the root of the archive).
2. Go to **Shopify Admin** $\rightarrow$ **Online Store** $\rightarrow$ **Themes**.
3. Under **Theme library**, click **Add theme** $\rightarrow$ **Upload zip file**.
4. Click **Customize** to preview and edit theme settings, or **Publish** to make it live.

---

## Part 2 — Embedded Shopify App (KitFlow)

### Architecture Highlights
- **Deterministic Scoring Engine**: Calculates numerical scores (0–100) using a transparent mathematical formula:
  $$\text{Total Score} = 0.35 \times \text{Sales} + 0.25 \times \text{Compatibility} + 0.20 \times \text{Inventory} + 0.20 \times \text{Discount}$$
- **Automated Inventory Alerts**: Flags bundles when any component stock falls to $\le 2$ (Critical) or $\le 5$ (Warning).
- **AI Bundle Analyst (Anthropic Claude)**: Server-side integration with Claude 3.5 Sonnet providing structured strategic analysis (`summary`, `strengths`, `risks`, `recommendations`) without controlling deterministic scoring.
- **Multi-Tenant Shop Isolation**: Every query strictly isolates records by `shop_id`.

For a deep dive into architectural tradeoffs and design rationale, see [`APP_DECISIONS.md`](file:///c:/Users/ALJON/Documents/Shopify%20Store/APP_DECISIONS.md).

For the exhaustive requirement audit matrix, see [`IMPLEMENTATION_CHECKLIST.md`](file:///c:/Users/ALJON/Documents/Shopify%20Store/IMPLEMENTATION_CHECKLIST.md).

# Deployment and live testing

JonTech is a Shopify theme plus KitFlow, an embedded merchant app. Customer accounts and their credentials belong to Shopify. KitFlow only reads customer records after Shopify grants the `read_customers` scope.

## 1. Configure customer accounts

1. In Shopify Admin, open **Settings > Customer accounts** and make customer sign-in links visible.
2. In **Content > Menus**, review `customer-account-main-menu`. Keep at least **Orders** and **Profile**.
3. Publish the `theme/` directory, or preview it with `shopify theme dev --store YOUR_STORE.myshopify.com`.

The theme already contains Shopify's `<shopify-account>` component in its header. It gives signed-out customers the native sign-in/create-account flow, and signed-in customers access to Orders and Profile. Do not create a second customer table or store passwords in this app.

## 2. Configure the embedded app

Create a production environment from `app/.env.example` and set real values:

```dotenv
NODE_ENV=production
USE_DEMO_DATA=false
APP_URL=https://app.example.com
SHOPIFY_APP_URL=https://app.example.com
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
VITE_SHOPIFY_API_KEY=the_same_public_client_id
SHOPIFY_SCOPES=read_products,write_products,read_orders,read_inventory,write_inventory,read_customers
DATABASE_URL=mysql://...
```

In the Shopify Dev Dashboard, set the app URL to `https://app.example.com` and add `https://app.example.com/auth/callback` as an allowed redirect URL. Save the new scopes, then reinstall the app on the dev store. Existing installs do not receive `read_customers` until they are reauthorized.

The built frontend loads Shopify App Bridge and sends a fresh Shopify ID token with each API call. In production, the backend verifies that token, its audience, issuer, destination, signature, and expiry before accessing a merchant's data.

## 3. Build and deploy

For a Node host with a persistent MySQL database:

```bash
npm ci
npm run db:migrate
npm run build
npm run start
```

The backend serves the built React app and `/health` is the health-check endpoint. A Dockerfile is included for hosts such as Render, Railway, Fly.io, or any container platform. Ensure the database and all environment variables are persistent; never run production with `USE_DEMO_DATA=true`.

## 4. Acceptance test

1. Open the unpublished theme preview in an incognito window on desktop and mobile.
2. Use the header account icon to create/sign in to a customer account, then return to the storefront.
3. Confirm the customer is present under **Shopify Admin > Customers > All customers** by email. Place a test order and verify it appears in the customer's native account order history.
4. Open KitFlow from Shopify Admin. Its **Customers** page should show the new record with a **Live Shopify Admin API** badge, and search should find the buyer's email.
5. If the page says the scope is missing, confirm the scope above in the Dev Dashboard and reinstall the app. If it shows a token error, open KitFlow from Shopify Admin rather than a copied direct URL.
6. Run the local quality gate before each deployment:

```bash
npm run typecheck
npm test
npm run build
```

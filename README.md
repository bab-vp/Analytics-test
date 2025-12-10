# Merchant API E-commerce Analytics

This repository contains a minimal, ready-to-run scaffold for connecting merchant APIs (Shopify + WooCommerce),
receiving webhooks, storing product/order data in Postgres, and a small Next.js dashboard.

## Quickstart

1. Start a Postgres database and run the SQL migrations in `server/src/db/migrations.sql`.
2. Create `.env` in `server/` using `.env.example` and fill values.
3. Install & run server:
   ```
   cd server
   npm install
   npm run dev
   ```
4. Install & run dashboard:
   ```
   cd dashboard
   npm install
   npm run dev
   ```
5. For Shopify, open:
   ```
   http://localhost:4000/auth/shopify/install?shop=your-shop.myshopify.com
   ```
   to start the OAuth install flow.
6. For WooCommerce, POST credentials to:
   ```
   POST http://localhost:4000/auth/woocommerce/register
   Body: { "store_url": "...", "consumer_key": "...", "consumer_secret": "..." }
   ```

## Notes

- Verify webhook signatures in production.
- Encrypt tokens at rest.
- Use official SDKs and follow platform rate limits.

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  DATABASE_URL: process.env.DATABASE_URL,

  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES || 'read_products,read_orders',
  SHOPIFY_REDIRECT_URI: process.env.SHOPIFY_REDIRECT_URI,

  WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY,
  WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET,

  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:4000',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me-please'
};

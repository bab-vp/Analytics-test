const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

router.get('/install', (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('missing shop');
  const state = crypto.randomBytes(16).toString('hex');
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${config.SHOPIFY_API_KEY}&scope=${config.SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(config.SHOPIFY_REDIRECT_URI)}&state=${state}`;
  res.redirect(installUrl);
});

router.get('/callback', async (req, res) => {
  try {
    const { shop, code } = req.query;
    if (!shop || !code) return res.status(400).send('missing params');

    const tokenRes = await axios.post(`https://${shop}/admin/oauth/access_token`, {
      client_id: config.SHOPIFY_API_KEY,
      client_secret: config.SHOPIFY_API_SECRET,
      code
    });

    const accessToken = tokenRes.data.access_token;
    const pool = req.db;
    const upsert = `INSERT INTO merchants (platform, shop_domain, api_token, api_key) VALUES ($1,$2,$3,$4)
                    ON CONFLICT (shop_domain) DO UPDATE SET api_token = EXCLUDED.api_token RETURNING id`;
    const vals = ['shopify', shop, accessToken, config.SHOPIFY_API_KEY];
    await pool.query(upsert, vals).catch(e => { console.error(e); });

    // register webhooks (best-effort)
    const headers = { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' };
    const webhookBase = `${config.APP_BASE_URL}/webhooks/shopify`;
    const webhooksToCreate = [
      { topic: 'orders/create', address: `${webhookBase}/orders`, format: 'json' },
      { topic: 'products/create', address: `${webhookBase}/products`, format: 'json' },
      { topic: 'products/update', address: `${webhookBase}/products`, format: 'json' }
    ];

    for (const wh of webhooksToCreate) {
      try {
        await axios.post(`https://${shop}/admin/api/2023-10/webhooks.json`, { webhook: wh }, { headers });
      } catch (err) { console.warn('webhook create failed', err?.response?.data || err.message); }
    }

    res.send('Shopify app installed — close this window.');
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
});

module.exports = router;

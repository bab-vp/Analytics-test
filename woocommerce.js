const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { store_url, consumer_key, consumer_secret } = req.body;
  if (!store_url || !consumer_key || !consumer_secret) return res.status(400).send('missing fields');

  const pool = req.db;
  const q = `INSERT INTO merchants (platform, wc_store_url, api_key, api_token) VALUES ($1,$2,$3,$4) RETURNING id`;
  const vals = ['woocommerce', store_url, consumer_key, consumer_secret];
  const result = await pool.query(q, vals);

  try {
    const ordersUrl = `${store_url.replace(/\/$/, '')}/wp-json/wc/v3/orders?per_page=1`;
    await axios.get(ordersUrl, { auth: { username: consumer_key, password: consumer_secret } });
  } catch (err) { console.warn('woocommerce verify failed', err?.response?.status); }

  res.json({ id: result.rows[0].id });
});

module.exports = router;

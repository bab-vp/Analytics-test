const express = require('express');
const crypto = require('crypto');
const config = require('../config');

const router = express.Router();

function verifyShopify(req) {
  const hmac = req.get('X-Shopify-Hmac-Sha256') || '';
  const body = JSON.stringify(req.body);
  const digest = crypto.createHmac('sha256', config.SHOPIFY_API_SECRET).update(body, 'utf8').digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
  } catch (e) {
    return false;
  }
}

router.post('/shopify/orders', async (req, res) => {
  try {
    if (!verifyShopify(req)) return res.status(401).send('invalid signature');
    const order = req.body;
    const pool = req.db;
    const shop = req.get('X-Shopify-Shop-Domain');
    const m = await pool.query('SELECT id FROM merchants WHERE shop_domain=$1', [shop]);
    const merchantId = m.rows[0]?.id || null;
    await pool.query('INSERT INTO orders (merchant_id, order_id, total, currency, raw) VALUES ($1,$2,$3,$4,$5)', [merchantId, order.id, order.total_price || order.current_total_price, order.currency || order.currency_iso_code, order]);
    res.status(200).send('ok');
  } catch (err) { console.error(err); res.status(500).send('error'); }
});

router.post('/shopify/products', async (req, res) => {
  try {
    if (!verifyShopify(req)) return res.status(401).send('invalid signature');
    const product = req.body;
    const pool = req.db;
    const shop = req.get('X-Shopify-Shop-Domain');
    const m = await pool.query('SELECT id FROM merchants WHERE shop_domain=$1', [shop]);
    const merchantId = m.rows[0]?.id || null;

    const upsert = `INSERT INTO products (merchant_id, product_id, title, sku, url, currency, current_price, updated_at)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,now())
                    ON CONFLICT (merchant_id, product_id) DO UPDATE SET title = EXCLUDED.title, current_price = EXCLUDED.current_price, updated_at = now()`;
    const firstVariant = product.variants && product.variants[0];
    const price = firstVariant?.price ? parseFloat(firstVariant.price) : null;
    const sku = firstVariant?.sku || null;
    const url = product.handle ? `https://${shop}/products/${product.handle}` : null;

    await pool.query(upsert, [merchantId, product.id, product.title, sku, url, null, price]);

    const prodRow = await pool.query('SELECT id FROM products WHERE merchant_id=$1 AND product_id=$2', [merchantId, product.id]);
    const pid = prodRow.rows[0].id;
    await pool.query('INSERT INTO product_snapshots (product_id, price, inventory, extra) VALUES ($1,$2,$3,$4)', [pid, price, product.total_inventory || null, product]);

    res.status(200).send('ok');
  } catch (err) { console.error(err); res.status(500).send('error'); }
});

router.post('/woocommerce/orders', async (req, res) => {
  try {
    const order = req.body;
    const pool = req.db;
    const merchantId = req.query.merchant_id || null;
    await pool.query('INSERT INTO orders (merchant_id, order_id, total, currency, raw) VALUES ($1,$2,$3,$4,$5)', [merchantId, order.id, order.total, order.currency, order]);
    res.status(200).send('ok');
  } catch (err) { console.error(err); res.status(500).send('error'); }
});

module.exports = router;

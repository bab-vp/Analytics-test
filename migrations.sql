CREATE TABLE merchants (
  id serial PRIMARY KEY,
  platform text NOT NULL,
  shop_domain text,
  wc_store_url text,
  api_token text,
  api_key text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id serial PRIMARY KEY,
  merchant_id integer REFERENCES merchants(id) ON DELETE CASCADE,
  product_id text,
  title text,
  sku text,
  url text,
  currency text,
  current_price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE product_snapshots (
  id serial PRIMARY KEY,
  product_id integer REFERENCES products(id) ON DELETE CASCADE,
  price numeric,
  inventory integer,
  extra jsonb,
  ts timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id serial PRIMARY KEY,
  merchant_id integer REFERENCES merchants(id) ON DELETE CASCADE,
  order_id text,
  total numeric,
  currency text,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_snapshots_product_ts ON product_snapshots(product_id, ts);

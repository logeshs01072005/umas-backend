-- Uma's Fashion & Boutique — PostgreSQL schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone         VARCHAR(20),
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(80) NOT NULL,
  description TEXT DEFAULT '',
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  mrp         NUMERIC(10,2) NOT NULL CHECK (mrp >= 0),
  sizes       TEXT[] NOT NULL DEFAULT '{}',
  tag         VARCHAR(40) DEFAULT '',
  image_url   TEXT DEFAULT '',
  stock       INTEGER NOT NULL DEFAULT 100,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       VARCHAR(30) NOT NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, size)
);

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(20) UNIQUE NOT NULL,
  user_id          UUID NOT NULL REFERENCES users(id),
  status           VARCHAR(20) NOT NULL DEFAULT 'Placed',
  payment_method   VARCHAR(10) NOT NULL CHECK (payment_method IN ('cod', 'online')),
  payment_status   VARCHAR(20) NOT NULL DEFAULT 'pending',
  razorpay_order_id   VARCHAR(80),
  razorpay_payment_id VARCHAR(80),
  subtotal         NUMERIC(10,2) NOT NULL,
  shipping_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  ship_name        VARCHAR(120) NOT NULL,
  ship_phone       VARCHAR(20) NOT NULL,
  ship_address     TEXT NOT NULL,
  ship_city        VARCHAR(80) NOT NULL,
  ship_pincode     VARCHAR(12) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(200) NOT NULL,
  category     VARCHAR(80) NOT NULL,
  price        NUMERIC(10,2) NOT NULL,
  size         VARCHAR(30) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

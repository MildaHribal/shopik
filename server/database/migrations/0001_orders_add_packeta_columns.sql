-- Add order metadata columns needed by checkout flow (Packeta branch, shipping/payment method, Stripe session).
-- Idempotent: safe to re-run on an already-patched DB.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS shipping_method text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS packeta_branch_id text,
  ADD COLUMN IF NOT EXISTS packeta_branch_name text,
  ADD COLUMN IF NOT EXISTS stripe_session_id text;

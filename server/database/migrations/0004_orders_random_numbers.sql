-- Randomized customer-facing order number + bank-transfer variable symbol.
-- Sequential serial IDs leaked order volume and made variable symbols guessable.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "order_number" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "variable_symbol" text;

-- Backfill existing rows so every order has a stable, non-null customer number.
-- Uses the id offset into a random-looking 8-digit range; existing orders are few.
UPDATE "orders"
SET "order_number" = LPAD(((("id" * 2654435761) % 90000000) + 10000000)::text, 8, '0')
WHERE "order_number" IS NULL;

UPDATE "orders"
SET "variable_symbol" = "order_number"
WHERE "variable_symbol" IS NULL;

-- Idempotent: swallow "already exists" so the migration can safely re-run.
DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

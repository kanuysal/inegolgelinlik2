-- Migration 012: Add Stripe payment fields to orders table
-- Supports Stripe Checkout integration with payment tracking and seller payouts

-- Stripe payment tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT CHECK (char_length(refund_reason) <= 500);

-- Seller payout tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending'
  CHECK (payout_status IN ('pending', 'scheduled', 'paid', 'failed'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payout_completed_at TIMESTAMPTZ;

-- Shipping address fields (buyer fills at checkout)
-- shipping_address JSONB already exists, we'll use it as:
-- { name, line1, line2, city, state, postal_code, country }

-- Indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_payout_status ON orders(payout_status) WHERE payout_status != 'paid';

-- Webhook event log for idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_webhook_events(event_type);

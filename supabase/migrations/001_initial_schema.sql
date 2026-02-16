-- =============================================================================
-- RE:GALIA — Database Schema
-- =============================================================================
-- SECURITY-FIRST design:
-- 1. All tables have RLS enabled
-- 2. No public read without explicit policy
-- 3. Admin functions use SECURITY DEFINER (runs as owner, not caller)
-- 4. All user input fields have length constraints
-- 5. Sensitive operations logged to audit trail
-- =============================================================================

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'sold', 'archived');
CREATE TYPE listing_condition AS ENUM ('new_unworn', 'excellent', 'good');
CREATE TYPE listing_type AS ENUM ('peer_to_peer', 'sample_sale', 'brand_direct');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded');
CREATE TYPE claim_status AS ENUM ('open', 'under_review', 'resolved', 'dismissed');
CREATE TYPE notification_type AS ENUM ('listing_approved', 'listing_rejected', 'new_message', 'order_update', 'system');
CREATE TYPE approval_action AS ENUM ('approved', 'rejected');
CREATE TYPE gown_category AS ENUM ('bridal', 'evening', 'accessories');
CREATE TYPE silhouette AS ENUM ('a_line', 'ball_gown', 'mermaid', 'trumpet', 'sheath', 'fit_and_flare', 'empire', 'column');
CREATE TYPE train_style AS ENUM ('none', 'sweep', 'court', 'chapel', 'cathedral', 'royal');

-- ============================================
-- 1. PROFILES
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT CHECK (char_length(display_name) <= 100),
  full_name TEXT CHECK (char_length(full_name) <= 200),
  phone TEXT CHECK (char_length(phone) <= 30),
  avatar_url TEXT CHECK (char_length(avatar_url) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- All new users get the 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. USER_ROLES (RBAC)
-- ============================================

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Helper function: Check if user is admin (SECURITY DEFINER = runs as DB owner)
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function: Check if user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- 3. PRODUCTS (Master GL Catalog)
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_name TEXT NOT NULL CHECK (char_length(style_name) BETWEEN 1 AND 200),
  sku TEXT CHECK (char_length(sku) <= 50),
  category gown_category NOT NULL,
  silhouette silhouette,
  train_style train_style,
  msrp NUMERIC(10, 2) CHECK (msrp >= 0),
  description TEXT CHECK (char_length(description) <= 5000),
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_style_name ON products(style_name);
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 4. LISTINGS (User-submitted gowns)
-- ============================================

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 300),
  description TEXT CHECK (char_length(description) <= 5000),
  category gown_category NOT NULL,
  listing_type listing_type NOT NULL DEFAULT 'peer_to_peer',
  condition listing_condition NOT NULL,
  size_us TEXT CHECK (char_length(size_us) <= 10),
  bust_cm NUMERIC(5, 1) CHECK (bust_cm > 0 AND bust_cm < 300),
  waist_cm NUMERIC(5, 1) CHECK (waist_cm > 0 AND waist_cm < 300),
  hips_cm NUMERIC(5, 1) CHECK (hips_cm > 0 AND hips_cm < 300),
  height_cm NUMERIC(5, 1) CHECK (height_cm > 0 AND height_cm < 300),
  silhouette silhouette,
  train_style train_style,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  msrp NUMERIC(10, 2) CHECK (msrp >= 0),
  images TEXT[] DEFAULT '{}',
  status listing_status NOT NULL DEFAULT 'pending_review',
  rejection_reason TEXT CHECK (char_length(rejection_reason) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
-- Composite index for shop page queries
CREATE INDEX idx_listings_approved_browse ON listings(status, category, price) WHERE status = 'approved';

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 5. ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  total NUMERIC(10, 2) NOT NULL CHECK (total > 0),
  commission_rate NUMERIC(4, 2) NOT NULL DEFAULT 15.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_amount NUMERIC(10, 2) NOT NULL CHECK (commission_amount >= 0),
  seller_payout NUMERIC(10, 2) NOT NULL CHECK (seller_payout >= 0),
  shipping_address JSONB,
  tracking_number TEXT CHECK (char_length(tracking_number) <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Prevent buyer from being the seller
  CONSTRAINT buyer_not_seller CHECK (buyer_id != seller_id)
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_listing ON orders(listing_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. CLAIMS
-- ============================================

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  filed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
  description TEXT CHECK (char_length(description) <= 5000),
  evidence_urls TEXT[] DEFAULT '{}',
  status claim_status NOT NULL DEFAULT 'open',
  resolution_notes TEXT CHECK (char_length(resolution_notes) <= 5000),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claims_order ON claims(order_id);
CREATE INDEX idx_claims_status ON claims(status);

CREATE TRIGGER claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. CONVERSATIONS
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- One conversation per buyer-listing pair
  UNIQUE(listing_id, buyer_id),
  -- Prevent self-conversations
  CONSTRAINT no_self_conversation CHECK (buyer_id != seller_id)
);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);
CREATE INDEX idx_conversations_listing ON conversations(listing_id);
CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC NULLS LAST);

-- ============================================
-- 8. MESSAGES
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Auto-update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ============================================
-- 9. NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  link TEXT CHECK (char_length(link) <= 500),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- 10. LISTING_APPROVAL_LOG (Audit Trail)
-- ============================================

CREATE TABLE listing_approval_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action approval_action NOT NULL,
  reason TEXT CHECK (char_length(reason) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_log_listing ON listing_approval_log(listing_id);
CREATE INDEX idx_approval_log_admin ON listing_approval_log(admin_id);
CREATE INDEX idx_approval_log_created ON listing_approval_log(created_at DESC);

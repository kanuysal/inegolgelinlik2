-- =============================================================================
-- RE:GALIA — Row Level Security Policies
-- =============================================================================
-- SECURITY PRINCIPLES:
-- 1. DENY ALL by default (RLS enabled = no access unless policy grants it)
-- 2. Users can only access their own data unless explicitly shared
-- 3. Admin checks use SECURITY DEFINER functions (prevents role spoofing)
-- 4. Write operations are strictly scoped (no mass updates)
-- 5. Sellers cannot modify listings after approval (prevents bait-and-switch)
-- 6. Financial data (orders) uses RESTRICT deletes (preserve audit trail)
-- =============================================================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_approval_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Anyone can read profiles (needed for seller info on listings)
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile insert is handled by trigger (SECURITY DEFINER), no direct insert
-- But we need a policy for the trigger function's SECURITY DEFINER context
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- USER_ROLES POLICIES
-- ============================================

-- Users can read their own roles
CREATE POLICY "roles_select_own"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all roles
CREATE POLICY "roles_select_admin"
  ON user_roles FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can assign roles
CREATE POLICY "roles_insert_admin"
  ON user_roles FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can modify roles
CREATE POLICY "roles_update_admin"
  ON user_roles FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can remove roles
CREATE POLICY "roles_delete_admin"
  ON user_roles FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PRODUCTS POLICIES (Master Catalog)
-- ============================================

-- Anyone can read active products (needed for sell wizard search)
CREATE POLICY "products_select_active"
  ON products FOR SELECT
  USING (is_active = true);

-- Admins can read all products (including inactive)
CREATE POLICY "products_select_admin"
  ON products FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can manage catalog
CREATE POLICY "products_insert_admin"
  ON products FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- LISTINGS POLICIES
-- ============================================

-- Anyone can read approved listings (shop page)
CREATE POLICY "listings_select_approved"
  ON listings FOR SELECT
  USING (status = 'approved');

-- Sellers can read their own listings (any status)
CREATE POLICY "listings_select_own"
  ON listings FOR SELECT
  USING (auth.uid() = seller_id);

-- Admins/moderators can read all listings
CREATE POLICY "listings_select_admin"
  ON listings FOR SELECT
  USING (is_moderator_or_admin(auth.uid()));

-- Authenticated users can create listings (seller_id must be themselves)
CREATE POLICY "listings_insert_own"
  ON listings FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND status IN ('draft', 'pending_review')  -- Can't self-approve
  );

-- Sellers can update their own DRAFT or PENDING listings only
-- This prevents modifying approved listings (bait-and-switch prevention)
CREATE POLICY "listings_update_own"
  ON listings FOR UPDATE
  USING (
    auth.uid() = seller_id
    AND status IN ('draft', 'pending_review')
  )
  WITH CHECK (
    auth.uid() = seller_id
    AND status IN ('draft', 'pending_review')  -- Can't self-approve
  );

-- Admins/moderators can update any listing (approve/reject)
CREATE POLICY "listings_update_admin"
  ON listings FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

-- Sellers can delete their own draft listings only
CREATE POLICY "listings_delete_own_draft"
  ON listings FOR DELETE
  USING (
    auth.uid() = seller_id
    AND status = 'draft'
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Buyers can read their own orders
CREATE POLICY "orders_select_buyer"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can read orders for their listings
CREATE POLICY "orders_select_seller"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id);

-- Admins can read all orders
CREATE POLICY "orders_select_admin"
  ON orders FOR SELECT
  USING (is_admin(auth.uid()));

-- Authenticated users can create orders (buyer must be themselves, can't buy own listing)
CREATE POLICY "orders_insert_buyer"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND auth.uid() != seller_id  -- Can't buy own listing
  );

-- Admins can update order status (shipping, tracking, etc.)
CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- Sellers can update tracking info on their orders
CREATE POLICY "orders_update_seller_tracking"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- No one can delete orders (financial audit trail)

-- ============================================
-- CLAIMS POLICIES
-- ============================================

-- Users can read claims they filed
CREATE POLICY "claims_select_own"
  ON claims FOR SELECT
  USING (auth.uid() = filed_by);

-- Admins can read all claims
CREATE POLICY "claims_select_admin"
  ON claims FOR SELECT
  USING (is_admin(auth.uid()));

-- Authenticated users can file claims on their orders
CREATE POLICY "claims_insert_own"
  ON claims FOR INSERT
  WITH CHECK (auth.uid() = filed_by);

-- Only admins can update claims (resolve/dismiss)
CREATE POLICY "claims_update_admin"
  ON claims FOR UPDATE
  USING (is_admin(auth.uid()));

-- No one can delete claims (audit trail)

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Participants can read their conversations
CREATE POLICY "conversations_select_participant"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Admins can read all conversations
CREATE POLICY "conversations_select_admin"
  ON conversations FOR SELECT
  USING (is_admin(auth.uid()));

-- Authenticated users can start conversations (must be the buyer)
CREATE POLICY "conversations_insert_buyer"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND auth.uid() != seller_id  -- Can't message yourself
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Conversation participants can read messages
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Admins can read all messages
CREATE POLICY "messages_select_admin"
  ON messages FOR SELECT
  USING (is_admin(auth.uid()));

-- Conversation participants can send messages
CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- Recipients can mark messages as read
CREATE POLICY "messages_update_read"
  ON messages FOR UPDATE
  USING (
    auth.uid() != sender_id  -- Only recipient marks as read
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  )
  WITH CHECK (is_read = true);  -- Can only set to read, not unread

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_read = true);

-- System/triggers create notifications (via SECURITY DEFINER functions)
-- Admin can create notifications for any user
CREATE POLICY "notifications_insert_admin"
  ON notifications FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- LISTING_APPROVAL_LOG POLICIES
-- ============================================

-- Admins can read the approval log
CREATE POLICY "approval_log_select_admin"
  ON listing_approval_log FOR SELECT
  USING (is_moderator_or_admin(auth.uid()));

-- Sellers can read approval logs for their own listings
CREATE POLICY "approval_log_select_seller"
  ON listing_approval_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_approval_log.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Only admins/moderators can create approval log entries
CREATE POLICY "approval_log_insert_admin"
  ON listing_approval_log FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

-- No one can update or delete approval logs (immutable audit trail)

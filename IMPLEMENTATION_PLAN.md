# RE:GALIA — Implementation Plan
## Porting Lovable Features to Next.js 14

---

## Current State (Next.js Project)
- **Pages**: Homepage (`/`), Shop (`/shop`), Product Detail (`/shop/[id]`), Sell (`/sell`)
- **Components**: Navbar, FilterBar, ProductCard, CoutureCanvas
- **Data**: Mock listings in `lib/mock-listings.ts`
- **Stack**: Next.js 14, Framer Motion, Tailwind CSS
- **Design**: Dark obsidian (#050505), champagne (#f5e6d3), gold-muted (#c9a96e)
- **No backend, no auth, no database**

---

## Phase 1: Supabase Foundation + Auth
**Goal**: Set up backend infrastructure and authentication

### 1A. Supabase Setup
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create Supabase client utilities (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- Set up environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Create middleware for auth session refresh (`middleware.ts`)

### 1B. Database Schema (10 tables)
```
profiles          — user profiles (display_name, full_name, phone, avatar_url)
user_roles        — RBAC (user_id, role: admin/moderator/user)
products          — master GL catalog (style_name, sku, category, msrp, images)
listings          — user-submitted gowns (seller_id, product_id, price, condition, status)
orders            — purchases (listing_id, buyer_id, status, total)
claims            — dispute/claim tracking
conversations     — chat threads (listing_id, buyer_id, seller_id)
messages          — chat messages (conversation_id, sender_id, content)
notifications     — user notifications (type, title, message, read)
listing_approval_log — admin audit trail (listing_id, admin_id, action, reason)
```

### 1C. Auth Pages
- `/auth/login` — Email/password + Google OAuth + Apple sign-in
- `/auth/signup` — Registration flow
- Auth callback handler (`/auth/callback`)
- Protected route middleware
- Session management with Supabase SSR

### 1D. RLS Policies
- Users can only read/update their own profiles
- Sellers can only manage their own listings
- Admins can read all data
- Messages restricted to conversation participants

---

## Phase 2: 5-Step Sell Wizard
**Goal**: Complete consignment submission flow

### Route: `/sell/submit` (multi-step form)

**Step 1 — Find Item**
- Search by style name or SKU against `products` table
- Category filter dropdown (Bridal Gowns, Evening Wear, Accessories)
- Manual entry option if item not in catalog
- Display matching product cards

**Step 2 — Item Details**
- Pre-fill from selected product (if matched)
- Fields: Style Name, Category, Size (US), Measurements (Bust, Waist, Hips, Height)
- Silhouette dropdown, Train Style dropdown
- Description textarea

**Step 3 — Condition**
- 3 radio cards: New & Unworn, Excellent, Good
- Gold checkmark on selection
- Each with description text

**Step 4 — Photos**
- Drag & drop upload zone
- Photo tips sidebar (lighting, angles, etc.)
- Max 8 photos, thumbnail preview grid
- Upload to Supabase Storage `listing-images` bucket

**Step 5 — Price**
- Suggested price based on condition + MSRP
- Custom price input
- Commission breakdown display (15% platform fee)
- Seller payout preview
- Submit → creates listing with `pending_review` status

### UI Pattern
- Step indicator bar (1-5) with progress
- BACK / CONTINUE navigation
- Form validation per step
- Dark obsidian theme matching existing design

---

## Phase 3: User Dashboard
**Goal**: Account management hub

### Route: `/dashboard` (tabbed layout)

**Tab 1 — My Listings**
- Card grid of user's listings
- Status badges: Pending Review, Approved, Rejected, Sold
- Edit/delete actions on pending listings
- Click to view listing detail

**Tab 2 — My Purchases**
- Order history with status tracking
- Empty state: "You haven't made any purchases yet." + BROWSE GOWNS CTA

**Tab 3 — Messages**
- Split-pane layout: conversation list (left) + chat area (right)
- Conversations grouped by listing
- Real-time messages via Supabase Realtime
- Message input with send button
- Timestamp display, sender identification

**Tab 4 — Profile**
- Avatar display + edit
- Form: Display Name, Full Name, Phone, Avatar URL
- SAVE CHANGES + SIGN OUT buttons

---

## Phase 4: Admin Center
**Goal**: Platform management for admins/moderators

### Route: `/admin` (sidebar layout, protected)

**Sidebar Navigation**: Overview, Listings, Catalog, Orders, Chat, Users, Analytics, Settings

**Overview Dashboard**
- 4 stat cards: Active Listings, Pending Approval, Total Orders, Total Users
- Recent Listings table (Title, Price, Status, Date)

**Listings Management**
- PENDING / ALL toggle tabs
- Table: Item (thumbnail + name), Price, Status, Date, View action
- Approve/Reject workflow with reason input
- Logs to `listing_approval_log`

**Product Catalog**
- Master product database (official GL styles)
- + ADD PRODUCT button
- CRUD for products table

**Users Management**
- Table: User (avatar + name + ID), Role badge, Joined date, Status, Actions
- Role management (promote to admin/moderator)

**Analytics**
- Charts: Listings by Month, Revenue by Month, Orders by Month
- Bar charts with grey/gold color scheme

**Settings**
- Commission rate (15% default)
- Shipping policy text
- Listing review SLA
- Integration status (Stripe Connect, Extensiv 3PL, Resend Email)

---

## Phase 5: Enhanced Shop & Product Detail
**Goal**: Connect shop to real data

- Replace mock data with Supabase queries
- Real-time filter/sort against `listings` + `products` tables
- Product detail page: gallery, pricing, measurements, seller info
- PURCHASE button → order creation flow
- MESSAGE SELLER button → creates conversation

---

## Technical Architecture

### File Structure (New)
```
app/
├── auth/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── callback/route.ts
├── sell/
│   ├── page.tsx (existing landing)
│   └── submit/page.tsx (5-step wizard)
├── dashboard/page.tsx
├── admin/
│   ├── page.tsx (overview)
│   ├── listings/page.tsx
│   ├── catalog/page.tsx
│   ├── orders/page.tsx
│   ├── chat/page.tsx
│   ├── users/page.tsx
│   ├── analytics/page.tsx
│   └── settings/page.tsx
lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
├── types/database.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useListings.ts
│   └── useMessages.ts
components/
├── ui/ (existing)
├── auth/
│   ├── LoginForm.tsx
│   └── SignupForm.tsx
├── sell/
│   ├── StepIndicator.tsx
│   ├── FindItem.tsx
│   ├── ItemDetails.tsx
│   ├── Condition.tsx
│   ├── Photos.tsx
│   └── Price.tsx
├── dashboard/
│   ├── MyListings.tsx
│   ├── MyPurchases.tsx
│   ├── Messages.tsx
│   └── Profile.tsx
├── admin/
│   ├── AdminSidebar.tsx
│   ├── StatsCards.tsx
│   └── ...
middleware.ts
```

### New Dependencies
```
@supabase/supabase-js
@supabase/ssr
lucide-react (icons)
react-hook-form (form management)
zod (validation)
recharts (admin analytics charts)
```

### Design System (Maintained)
- Background: obsidian (#050505) for user-facing pages
- Admin: light/cream background with dark sidebar
- Accents: gold-muted (#c9a96e), champagne (#f5e6d3)
- Typography: Cormorant Garamond (headings), Inter (body)
- Badges: gold for approved, red for rejected, grey for pending

---

## Implementation Order

1. **Phase 1A+B** — Supabase + Schema (foundation)
2. **Phase 1C** — Auth pages (unblocks everything)
3. **Phase 2** — Sell Wizard (core marketplace action)
4. **Phase 3** — User Dashboard (user account management)
5. **Phase 4** — Admin Center (platform management)
6. **Phase 5** — Connect Shop to real data

Each phase builds on the previous. Phase 1 is the critical foundation — nothing works without auth and database.

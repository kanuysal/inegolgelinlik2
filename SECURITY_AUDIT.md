# RE:GALIA Security Audit Report
Generated: 2026-02-26

## ✅ GOOD - Current Security Status

### 1. Logout Button
- **Status**: ✅ EXISTS
- **Location**: Navbar mobile menu (line 231-236)
- **Function**: `handleSignOut()` properly signs out and redirects to home

### 2. Email Uniqueness Across Auth Methods
- **Status**: ✅ HANDLED BY SUPABASE
- **Details**: Supabase automatically enforces email uniqueness across ALL auth providers
  - If user signs up with Google using `user@example.com`
  - They CANNOT create a separate email/password account with `user@example.com`
  - Supabase returns error: "User already registered"
  - **ACTION NEEDED**: Need to add better error messaging in signup/login forms

### 3. Row Level Security (RLS)
- **Status**: ✅ ENABLED on all tables
- Tables protected:
  - `profiles` - Users can only update their own
  - `listings` - Sellers can only modify draft/pending
  - `orders` - Buyers/sellers can only see their own
  - `messages` - Only conversation participants can access
  - `notifications` - Users only see their own
  - `user_roles` - Admins only

### 4. Authentication Security
- **Status**: ✅ GOOD
- Server-side session management via cookies
- Middleware refreshes sessions automatically
- Admin client only used in server actions with auth checks

---

## ⚠️ MEDIUM RISK - Issues to Fix Before Launch

### 1. **Exposed API Keys in .env.local**
- **Risk**: MEDIUM
- **Issue**: Sensitive keys in version control
```bash
STOCKIST_PASSWORD="Udi12345^"  # ⚠️ Should be rotated
KUSTOMER_WEBHOOK_SECRET="..."  # ⚠️ Should be in Vercel only
RESEND_API_KEY="..."           # ⚠️ Should be in Vercel only
```
- **Fix**:
  1. Remove from `.env.local`
  2. Add to Vercel environment variables only
  3. Add `.env.local` to `.gitignore` (if not already)
  4. Rotate stockist password

### 2. **Service Role Key Exposed**
- **Risk**: HIGH if committed to git
- **Issue**: `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- **Fix**:
  - Verify `.env.local` is in `.gitignore`
  - Check git history for leaked keys: `git log -p | grep SERVICE_ROLE`
  - If found in history, rotate the key in Supabase dashboard

### 3. **Missing Rate Limiting**
- **Risk**: MEDIUM
- **Issue**: No rate limiting on:
  - `/api/kustomer/webhook`
  - Login/signup forms (brute force risk)
  - Listing submission
- **Fix**: Add rate limiting using Vercel Edge Config or Upstash Redis

### 4. **Weak Admin Check**
- **Risk**: MEDIUM
- **Current**: `checkIsStaff()` function
- **Issue**: Not using database roles consistently
- **Fix**: Enforce admin checks via RLS policies + database roles

### 5. **No CSRF Protection on State-Changing APIs**
- **Risk**: MEDIUM
- **Issue**: Webhook endpoints don't verify origin
- **Fix**: Add CSRF tokens or verify webhook signatures

---

## 🚨 HIGH RISK - Critical Issues

### 1. **Webhook Security**
**File**: `app/api/kustomer/webhook/route.ts`
- **Issue**: Webhook secret validation may be weak
- **Fix**: Implement proper HMAC signature verification

### 2. **Unrestricted File Uploads**
**File**: `app/sell/submit/actions.ts`
- **Current**: Only checks file type and size (5MB)
- **Missing**:
  - Image content validation (could upload malicious files renamed as .jpg)
  - Virus scanning
  - Metadata stripping (EXIF data may leak location)
- **Fix**:
  ```typescript
  - Add image processing/sanitization
  - Use sharp library to re-encode images
  - Strip EXIF data
  ```

### 3. **SQL Injection Risk in Custom Queries**
**Status**: ✅ LOW RISK (using parameterized queries)
- All queries use Supabase client which auto-escapes
- But be careful with any raw SQL in future migrations

### 4. **XSS Risk in User-Generated Content**
- **Locations**:
  - Listing titles/descriptions
  - Profile display names
  - Messages
- **Current**: React auto-escapes by default ✅
- **Risk**: If using `dangerouslySetInnerHTML` anywhere
- **Fix**: Audit all uses of `dangerouslySetInnerHTML`

---

## 📋 Pre-Launch Checklist

### Environment & Secrets
- [ ] Remove all API keys from `.env.local`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Check git history for leaked secrets
- [ ] Rotate any exposed credentials
- [ ] Set all secrets in Vercel environment variables
- [ ] Use different keys for production vs development

### Authentication
- [x] Email uniqueness enforced (Supabase handles this)
- [ ] Add better error messages for duplicate email signup
- [ ] Add password strength requirements (8+ chars, uppercase, number)
- [ ] Enable 2FA for admin accounts
- [ ] Test logout button works on all pages
- [ ] Add session timeout (Supabase default: 1 hour - verify this is acceptable)

### Authorization
- [x] RLS enabled on all tables
- [ ] Test that users can't access other users' data
- [ ] Verify sellers can't modify approved listings (bait-and-switch prevention)
- [ ] Test admin-only routes are protected

### Input Validation
- [ ] Add rate limiting to all forms
- [ ] Sanitize file uploads (re-encode images)
- [ ] Add CAPTCHA to signup/contact forms (prevent spam)
- [ ] Validate all URL inputs (prevent open redirects)

### API Security
- [ ] Add webhook signature verification
- [ ] Add CORS headers to API routes
- [ ] Add rate limiting to webhooks
- [ ] Return generic error messages (don't leak system info)

### Data Protection
- [ ] Enable Supabase database backups
- [ ] Test data recovery process
- [ ] Add audit logging for sensitive operations
- [ ] Implement GDPR data export/deletion

### Monitoring
- [ ] Set up Vercel error tracking
- [ ] Add Supabase logging/alerts
- [ ] Monitor failed login attempts
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### Legal/Compliance
- [ ] Add Privacy Policy
- [ ] Add Terms of Service
- [ ] Add Cookie Consent banner (GDPR)
- [ ] Add return/refund policy
- [ ] Add contact information

---

## 🔧 Immediate Actions Required

1. **Check if .env.local is in git history**:
   ```bash
   git log --all --full-history -- .env.local
   ```
   If found: Rotate ALL keys immediately

2. **Add better signup error handling**:
   - Show "Email already exists" with link to login
   - Suggest Google login if email is associated with Google account

3. **Secure file uploads**:
   - Install `sharp`: `npm install sharp`
   - Re-encode all uploaded images
   - Strip EXIF metadata

4. **Add rate limiting**:
   - Install Upstash Redis or use Vercel Edge Config
   - Limit login attempts: 5 per 15 minutes per IP
   - Limit listing submissions: 10 per day per user

---

## 📊 Risk Summary

| Category | Count | Priority |
|----------|-------|----------|
| Critical | 2 | Fix before launch |
| High | 1 | Fix within 1 week |
| Medium | 5 | Fix within 2 weeks |
| Low | 0 | - |
| Good | 8 | ✅ |

**Overall Status**: 🟡 MEDIUM RISK
**Launch Readiness**: Not recommended until critical issues fixed

---

## Next Steps

1. Fix critical file upload security
2. Verify no secrets in git history
3. Add rate limiting
4. Test auth edge cases
5. Get security review from second developer
6. Consider penetration testing before launch

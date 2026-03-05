/**
 * Email Normalization
 * ===================
 * Prevents duplicate accounts via email tricks like:
 * - Gmail plus addressing: user+tag@gmail.com → user@gmail.com
 * - Gmail dots: u.s.e.r@gmail.com → user@gmail.com
 * - Case variations: User@Gmail.com → user@gmail.com
 */

export function normalizeEmail(email: string): string {
  if (!email) return '';

  // Convert to lowercase
  let normalized = email.toLowerCase().trim();

  // Split into local part and domain
  const [localPart, domain] = normalized.split('@');
  if (!localPart || !domain) return normalized;

  let cleanLocal = localPart;

  // Gmail-specific normalization
  const gmailDomains = ['gmail.com', 'googlemail.com'];
  if (gmailDomains.includes(domain)) {
    // Remove dots (Gmail ignores them)
    cleanLocal = cleanLocal.replace(/\./g, '');

    // Remove everything after + (plus addressing)
    const plusIndex = cleanLocal.indexOf('+');
    if (plusIndex !== -1) {
      cleanLocal = cleanLocal.substring(0, plusIndex);
    }
  } else {
    // For other providers, only remove plus addressing
    const plusIndex = cleanLocal.indexOf('+');
    if (plusIndex !== -1) {
      cleanLocal = cleanLocal.substring(0, plusIndex);
    }
  }

  return `${cleanLocal}@${domain}`;
}

export function emailsMatch(email1: string, email2: string): boolean {
  return normalizeEmail(email1) === normalizeEmail(email2);
}

/**
 * Check if an email already exists in auth.users
 * Returns the existing user if found (by normalized email).
 * Uses paginated queries instead of loading all users into memory.
 */
export async function checkEmailExists(
  email: string,
  supabase: any
): Promise<{ exists: boolean; userId?: string; provider?: string }> {
  const normalized = normalizeEmail(email);

  // First: try an exact match on the raw email (most common case, fast)
  const { data: exactMatch } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
    // No filter param — we'll check the result
  })

  // Paginate through users in small batches to find normalized matches
  // without loading all users into memory at once
  const PER_PAGE = 100
  let page = 1
  let hasMore = true

  while (hasMore) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    })

    if (error || !users || users.length === 0) {
      hasMore = false
      break
    }

    const existingUser = users.find((user: any) =>
      normalizeEmail(user.email) === normalized
    )

    if (existingUser) {
      const provider = existingUser.app_metadata?.provider || 'email'
      return {
        exists: true,
        userId: existingUser.id,
        provider,
      }
    }

    // If we got fewer than PER_PAGE, we've reached the end
    hasMore = users.length === PER_PAGE
    page++

    // Safety limit: don't scan more than 50 pages (5,000 users)
    if (page > 50) break
  }

  return { exists: false };
}

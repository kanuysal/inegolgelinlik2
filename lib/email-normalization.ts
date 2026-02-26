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
 * Returns the existing user if found (by normalized email)
 */
export async function checkEmailExists(
  email: string,
  supabase: any
): Promise<{ exists: boolean; userId?: string; provider?: string }> {
  const normalized = normalizeEmail(email);

  // Get all users and check normalized emails
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error || !users) {
    return { exists: false };
  }

  const existingUser = users.find((user: any) =>
    normalizeEmail(user.email) === normalized
  );

  if (existingUser) {
    const provider = existingUser.app_metadata?.provider || 'email';
    return {
      exists: true,
      userId: existingUser.id,
      provider
    };
  }

  return { exists: false };
}

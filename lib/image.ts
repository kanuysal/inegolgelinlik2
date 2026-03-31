/**
 * Image URL helpers for ucarecdn and other CDN sources.
 * Adds resize/format transforms to reduce bandwidth and improve scroll performance.
 */

/** Placeholder shown when a listing has no usable image */
export const PLACEHOLDER_IMG = '/placeholder-gown.svg'

/** Allowed image URL hostnames to prevent tracking pixels and arbitrary content */
const ALLOWED_IMAGE_HOSTS = [
  'ucarecdn.com',
  'cdn.shopify.com',
  'cdn.stockist.galialahav.com',
  'www.galialahav.com',
  'images.unsplash.com',
]

/** Validate image URL against allowlist. Returns placeholder for untrusted domains. */
function validateImageUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return PLACEHOLDER_IMG
    }
    if (ALLOWED_IMAGE_HOSTS.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) {
      return url
    }
    // Allow Supabase storage URLs
    if (parsed.hostname.endsWith('.supabase.co')) {
      return url
    }
    return PLACEHOLDER_IMG
  } catch {
    return PLACEHOLDER_IMG
  }
}

/**
 * Returns an optimized thumbnail URL for listing grid/card views.
 * For ucarecdn URLs, appends resize transforms (600px wide).
 * For other URLs, validates domain and returns as-is.
 */
export function thumb(url: string | undefined | null, width = 600): string {
  if (!url || !url.trim()) return PLACEHOLDER_IMG
  if (!url.includes('ucarecdn.com/')) return validateImageUrl(url)

  // Strip existing transforms and rebuild with resize
  const base = url.match(/https:\/\/ucarecdn\.com\/[a-f0-9-]{36}\//)?.[0]
  if (!base) return url

  return `${base}-/resize/${width}x/-/format/auto/-/quality/smart/`
}

/**
 * Returns a full-resolution optimized URL for detail views.
 * Applies quality/format optimization but no resize.
 */
export function fullImg(url: string | undefined | null): string {
  if (!url || !url.trim()) return PLACEHOLDER_IMG
  if (!url.includes('ucarecdn.com/')) return validateImageUrl(url)

  const base = url.match(/https:\/\/ucarecdn\.com\/[a-f0-9-]{36}\//)?.[0]
  if (!base) return url

  return `${base}-/format/auto/-/quality/smart/`
}

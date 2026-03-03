/**
 * Image URL helpers for ucarecdn and other CDN sources.
 * Adds resize/format transforms to reduce bandwidth and improve scroll performance.
 */

/**
 * Returns an optimized thumbnail URL for listing grid/card views.
 * For ucarecdn URLs, appends resize transforms (600px wide).
 * For other URLs, returns as-is.
 */
export function thumb(url: string | undefined | null, width = 600): string {
  if (!url) return '/placeholder-gown.jpg'
  if (!url.includes('ucarecdn.com/')) return url

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
  if (!url) return '/placeholder-gown.jpg'
  if (!url.includes('ucarecdn.com/')) return url

  const base = url.match(/https:\/\/ucarecdn\.com\/[a-f0-9-]{36}\//)?.[0]
  if (!base) return url

  return `${base}-/format/auto/-/quality/smart/`
}

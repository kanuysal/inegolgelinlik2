/**
 * Galia Lahav Stockist API Client
 * ================================
 * Server-side only. Authenticates via Inertia.js login,
 * then paginates through /our-products to fetch all dresses.
 */

// ── Types ──────────────────────────────────────────────

export interface StockistImage {
  id: number
  name: string
  url: string
  thumbnail: string
  isPrimary: boolean
}

export interface StockistCollection {
  id: number
  name: string
  collectionLineName: string
  isAvailable: boolean
}

export interface StockistHashtag {
  id: number
  name: string
  categoryCode: string
  categoryName: string
}

export interface StockistProduct {
  id: number
  name: string
  description: string
  retailPrice: { amount: number; currency: string }
  primaryImage: StockistImage | null
  collection: StockistCollection
  images: StockistImage[]
  modelNumber: string
  type: { id: number; name: string; code: string }
  hashtags: StockistHashtag[]
}

// ── Helpers ────────────────────────────────────────────

/** Get Set-Cookie header values, compatible with Node.js 18+ */
function getSetCookieHeaders(headers: Headers): string[] {
  // Node.js 20+ has getSetCookie()
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie()
  }
  // Node.js 18 fallback: parse the raw 'set-cookie' header
  // Headers.get('set-cookie') joins multiple values with ', '
  // But cookie values contain '=' and may contain ','
  // We split on patterns like ", NAME=" where NAME is a known cookie
  const raw = headers.get('set-cookie')
  if (!raw) return []
  // Split on ", " followed by a cookie name (word chars followed by =)
  return raw.split(/,\s*(?=[A-Za-z_][A-Za-z0-9_]*=)/)
}

/** Parse a single Set-Cookie string into {name, value} */
function parseCookie(setCookie: string): { name: string; value: string } | null {
  const [pair] = setCookie.split(';')
  const eqIdx = pair.indexOf('=')
  if (eqIdx === -1) return null
  return { name: pair.slice(0, eqIdx).trim(), value: pair.slice(eqIdx + 1).trim() }
}

/** Parse cookies from Set-Cookie headers into a cookie string */
function extractCookies(headers: Headers): string {
  const cookies: Record<string, string> = {}
  for (const sc of getSetCookieHeaders(headers)) {
    const parsed = parseCookie(sc)
    if (parsed) cookies[parsed.name] = parsed.value
  }
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

/** Merge new cookies into existing cookie string */
function mergeCookies(existing: string, newHeaders: Headers): string {
  const map: Record<string, string> = {}
  // Parse existing
  existing.split('; ').forEach((c) => {
    const eqIdx = c.indexOf('=')
    if (eqIdx > 0) map[c.slice(0, eqIdx).trim()] = c.slice(eqIdx + 1)
  })
  // Merge new
  for (const sc of getSetCookieHeaders(newHeaders)) {
    const parsed = parseCookie(sc)
    if (parsed) map[parsed.name] = parsed.value
  }
  return Object.entries(map)
    .filter(([k]) => k.length > 0)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')
}

/** Extract CSRF token and Inertia version from an HTML login page */
function parseLoginPage(html: string): { csrf: string; version: string } {
  const match = html.match(/data-page="([^"]+)"/)
  if (!match) throw new Error('Could not find Inertia data-page in login HTML')
  const raw = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  const data = JSON.parse(raw)
  return { csrf: data.props.csrf, version: data.version }
}

// ── Main API ───────────────────────────────────────────

const STOCKIST_BASE = 'https://stockist.galialahav.com'
const DRESS_TYPES = new Set(['wedding_dress', 'evening_dress'])

/**
 * Authenticate with the stockist and return session cookies.
 */
export async function loginToStockist(): Promise<{ cookies: string; version: string }> {
  const username = process.env.STOCKIST_USERNAME
  const password = process.env.STOCKIST_PASSWORD
  if (!username || !password) throw new Error('Missing STOCKIST_USERNAME or STOCKIST_PASSWORD env vars')

  // Step 1: GET /login to obtain CSRF token + session cookie
  const loginPageRes = await fetch(`${STOCKIST_BASE}/login`, { redirect: 'manual' })
  let cookies = extractCookies(loginPageRes.headers)
  const html = await loginPageRes.text()
  const { csrf, version } = parseLoginPage(html)

  // Step 2: POST /login with credentials
  const loginRes = await fetch(`${STOCKIST_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
      'X-Inertia': 'true',
      'X-Inertia-Version': version,
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: cookies,
    },
    body: JSON.stringify({ username, password }),
    redirect: 'manual',
  })

  // 409 is expected (Inertia version conflict) but session cookies are set
  cookies = mergeCookies(cookies, loginRes.headers)

  return { cookies, version }
}

/**
 * Fetch all dress products from the stockist (wedding_dress + evening_dress).
 * Paginates automatically through all pages.
 */
export async function fetchStockistDresses(): Promise<StockistProduct[]> {
  const { cookies, version } = await loginToStockist()

  if (!cookies || cookies.length < 10) {
    throw new Error(`Login failed: no session cookies received`)
  }

  const allDresses: StockistProduct[] = []
  let page = 1
  let lastPage = 1

  while (page <= lastPage) {
    const url = `${STOCKIST_BASE}/our-products?price_type=retail_sale_price&page=${page}`
    const res = await fetch(url, {
      headers: {
        'X-Inertia': 'true',
        'X-Inertia-Version': version,
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookies,
      },
    })

    const text = await res.text()
    let json: any
    try {
      json = JSON.parse(text)
    } catch {
      // HTML response — parse Inertia data-page from it
      const m = text.match(/data-page="([^"]+)"/)
      if (m) {
        const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')
        json = JSON.parse(raw)
      } else {
        throw new Error(`Page ${page}: unexpected response (not JSON or Inertia HTML)`)
      }
    }

    // If redirected to login, session expired
    if (json.component === 'Auth/Login') {
      throw new Error(`Stockist session expired on page ${page}`)
    }

    const productsPage = json.props?.products
    if (!productsPage?.data) {
      throw new Error(`Page ${page}: no products data in response (component: ${json.component})`)
    }

    // Update last page from pagination metadata
    if (page === 1) {
      lastPage = productsPage.last_page || 1
    }

    // Filter for dresses only
    for (const product of productsPage.data) {
      if (DRESS_TYPES.has(product.type?.code)) {
        allDresses.push(product)
      }
    }

    page++
  }

  return allDresses
}

/**
 * Get grouped hashtag values for a stockist product.
 * Returns a map: { neckline: ["V-Neck"], shape: ["Mermaid"], colors: ["Ivory", "Blush"], ... }
 */
export function groupHashtags(hashtags: StockistHashtag[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {}
  for (const h of hashtags) {
    const code = h.categoryCode
    if (!groups[code]) groups[code] = []
    groups[code].push(h.name)
  }
  return groups
}

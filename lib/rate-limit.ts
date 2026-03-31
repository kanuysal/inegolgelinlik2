import { Redis } from '@upstash/redis'

type RateLimitConfig = {
  key: string
  limit: number
  windowSeconds: number
}

let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} else {
  // M1 fix: Log a clear warning at startup — no silent in-memory fallback
  console.warn('[rate-limit] UPSTASH_REDIS_REST_URL / TOKEN not configured — rate limiting will REJECT all requests (fail-closed). Set these env vars to enable rate limiting.')
}

/**
 * Simple fixed-window rate limiter.
 * Returns true if under limit, false if rate-limited.
 *
 * M1 fix: Removed in-memory fallback — it provided false security in serverless
 * environments where each instance has independent memory. Now fail-closed when
 * Redis is unavailable.
 */
export async function rateLimit(config: RateLimitConfig): Promise<boolean> {
  if (!redis) {
    // M1 fix: Fail-closed when Redis is not configured. In-memory fallback was
    // ineffective in serverless (each cold start = fresh empty counters).
    console.error('[rate-limit] Redis not configured — rejecting request (fail-closed)')
    return false
  }

  const { key, limit, windowSeconds } = config

  try {
    const now = Math.floor(Date.now() / 1000)
    const windowKey = `${key}:${Math.floor(now / windowSeconds)}`

    const count = await redis.incr(windowKey)
    if (count === 1) {
      // First hit in this window; set TTL
      await redis.expire(windowKey, windowSeconds)
    }

    return count <= limit
  } catch (err) {
    console.error('[rate-limit] Redis error — rejecting request (fail-closed)', err)
    return false
  }
}

/**
 * H3 fix: Extract client IP from trusted sources.
 * On Vercel, x-real-ip is set by the edge and cannot be spoofed by clients.
 * Only fall back to x-forwarded-for if x-real-ip is absent.
 * IMPORTANT: This function is Vercel-specific. If deploying elsewhere,
 * ensure your proxy sets x-real-ip from the actual socket address.
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  // Prefer x-real-ip (set by Vercel edge, not spoofable)
  return req.headers.get('x-real-ip') || 'unknown'
}

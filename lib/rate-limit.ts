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
}

/**
 * In-memory rate limit fallback (per-instance only).
 * Used when Redis is not configured or errors out.
 */
const inMemoryStore = new Map<string, { count: number; expires: number }>()

function inMemoryRateLimit(config: RateLimitConfig): boolean {
  const now = Math.floor(Date.now() / 1000)
  const windowKey = `${config.key}:${Math.floor(now / config.windowSeconds)}`

  const entry = inMemoryStore.get(windowKey)
  if (entry && entry.expires > now) {
    entry.count++
    return entry.count <= config.limit
  }

  // Cleanup expired entries periodically
  if (inMemoryStore.size > 1000) {
    inMemoryStore.forEach((v, k) => {
      if (v.expires <= now) inMemoryStore.delete(k)
    })
  }

  inMemoryStore.set(windowKey, { count: 1, expires: now + config.windowSeconds })
  return true
}

/**
 * Simple fixed-window rate limiter.
 * Returns true if under limit, false if rate-limited.
 * Falls back to in-memory rate limiting when Redis is not configured.
 */
export async function rateLimit(config: RateLimitConfig): Promise<boolean> {
  if (!redis) {
    console.warn('[rate-limit] Redis not configured — using in-memory fallback')
    return inMemoryRateLimit(config)
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

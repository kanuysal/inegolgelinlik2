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
 * Simple fixed-window rate limiter.
 * Returns true if under limit, false if rate-limited.
 * If Redis is not configured, it behaves as a no-op (always true).
 */
export async function rateLimit(config: RateLimitConfig): Promise<boolean> {
  if (!redis) {
    // No backing store configured; skip limiting but avoid breaking flows.
    return true
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
    console.error('[rate-limit] error', err)
    // Fail open to avoid breaking primary flows if Redis has an issue
    return true
  }
}


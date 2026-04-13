import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

type RedisClient = Pick<Redis, 'get' | 'set' | 'del' | 'createScript'>

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
const hasUpstashCredentials = Boolean(upstashUrl && upstashToken)

function createMissingRedisClient(): RedisClient {
  const unavailable = async () => {
    throw new Error('Upstash Redis is not configured.')
  }

  return {
    get: unavailable,
    set: unavailable,
    del: unavailable,
    createScript: () => ({
      eval: unavailable,
    }),
  } as RedisClient
}

// Warn loudly at module init if Upstash credentials are missing in production.
// Missing credentials disable all rate limiting, but request behavior on rate-limit
// failures depends on each call site: some handlers may allow through, while others
// may fail closed and return an error instead.
if (process.env.NODE_ENV === 'production' &&
  (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)) {
  console.error(
    '[upstash] CRITICAL: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. ' +
    'All rate limiting (OTP, login, booking, uploads, messaging, AI) is DISABLED. ' +
    'Set both environment variables immediately.'
  )
}

const configuredRedis = hasUpstashCredentials
  ? new Redis({
      url: upstashUrl,
      token: upstashToken,
    })
  : null

export const redisClient: RedisClient = (configuredRedis as RedisClient | null) ?? createMissingRedisClient()
export const redis = redisClient

export const apiRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(20, '10 s'),
  prefix: 'bp:api',
})

export const otpRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'bp:otp',
})

export const previewRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'bp:preview',
})

export const bookingIpRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(6, '30 m'),
  prefix: 'bp:booking:ip',
})

export const bookingUserRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(1, '2 m'),
  prefix: 'bp:booking:user',
})

export const uploadRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(20, '10 m'),
  prefix: 'bp:upload',
})

export const messagesRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  prefix: 'bp:messages',
})

export const reviewsRatelimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'bp:reviews',
})

const releaseOwnedLockScript = redisClient.createScript<number>([
  'local current = redis.call("GET", KEYS[1])',
  'if current == ARGV[1] then',
  '  return redis.call("DEL", KEYS[1])',
  'end',
  'return 0',
].join('\n'))

const refreshOwnedLockScript = redisClient.createScript<number>([
  'local current = redis.call("GET", KEYS[1])',
  'if current == ARGV[1] then',
  '  return redis.call("EXPIRE", KEYS[1], tonumber(ARGV[2]))',
  'end',
  'return 0',
].join('\n'))

const BOOKING_HOLD_MAX_TTL_SECONDS = 2 * 60 * 60
const BOOKING_HOLD_MIN_TTL_SECONDS = 5 * 60

export function getActiveBookingIpHoldKey(ipAddress: string, providerId: string): string {
  return `bp:booking:active-ip:${ipAddress}:provider:${providerId}`
}

export function getActiveBookingAppointmentHoldKey(appointmentId: string): string {
  return `bp:booking:active-appointment:${appointmentId}`
}

export function getProviderAvailabilityRewriteLockKey(providerId: string): string {
  return `bp:provider:availability-rewrite:${providerId}`
}

export async function releaseRedisLockIfOwned(lockKey: string, lockToken: string): Promise<boolean> {
  const released = await releaseOwnedLockScript.eval([lockKey], [lockToken])
  return released === 1
}

export async function refreshRedisLockIfOwned(lockKey: string, lockToken: string, ttlSeconds: number): Promise<boolean> {
  const refreshed = await refreshOwnedLockScript.eval([lockKey], [lockToken, String(ttlSeconds)])
  return refreshed === 1
}

export function getActiveBookingHoldTtlSeconds(startsAt: string | null | undefined): number {
  if (!startsAt) {
    return BOOKING_HOLD_MIN_TTL_SECONDS
  }

  const startsAtTimestamp = Date.parse(startsAt)
  if (Number.isNaN(startsAtTimestamp)) {
    return BOOKING_HOLD_MIN_TTL_SECONDS
  }

  const secondsUntilStart = Math.ceil((startsAtTimestamp - Date.now()) / 1000)

  return Math.min(
    BOOKING_HOLD_MAX_TTL_SECONDS,
    Math.max(BOOKING_HOLD_MIN_TTL_SECONDS, secondsUntilStart),
  )
}

export const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute

export const RATE_LIMIT_DEFAULTS = {
  STOREFRONT_READ: { limit: 120, windowMs: RATE_LIMIT_WINDOW_MS },
  STOREFRONT_WRITE: { limit: 10, windowMs: RATE_LIMIT_WINDOW_MS },
  STOREFRONT_VIEW: { limit: 30, windowMs: RATE_LIMIT_WINDOW_MS }, // increment-view
  LEGACY_API: { limit: 30, windowMs: RATE_LIMIT_WINDOW_MS },
  AUTH: { limit: 20, windowMs: RATE_LIMIT_WINDOW_MS },
}

export const RATE_LIMIT_METADATA_KEY = 'rateLimit'

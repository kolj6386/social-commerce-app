export type RateLimitScope = 'ip' | 'shop-ip' | 'shop-ip-write'
export interface RateLimitRecord {
  count: number
  resetsAt: number
}
export interface RateLimitOptions {
  limit: number
  windowMs: number
  scope?: RateLimitScope
}
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}
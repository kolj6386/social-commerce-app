import { Injectable } from '@nestjs/common'
import { LRUCache } from 'lru-cache'
import type { RateLimitRecord, RateLimitResult } from './rate-limit.types'

@Injectable()
export class RateLimitStore {
  private readonly cache: LRUCache<string, RateLimitRecord>

  constructor() {
    const max = parseInt(process.env.RATE_LIMIT_MAX_KEYS ?? '10000', 10)
    this.cache = new LRUCache<string, RateLimitRecord>({ max })
  }

  checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now()
    let record = this.cache.get(key)

    if (!record || now > record.resetsAt) {
      record = { count: 0, resetsAt: now + windowMs }
    }

    record.count += 1
    const ttl = Math.max(record.resetsAt - now, 1)
    this.cache.set(key, record, { ttl })

    const allowed = record.count <= limit
    const remaining = Math.max(limit - record.count, 0)
    const retryAfterSeconds = Math.ceil((record.resetsAt - now) / 1000)

    return { allowed, remaining, retryAfterSeconds }
  }
}

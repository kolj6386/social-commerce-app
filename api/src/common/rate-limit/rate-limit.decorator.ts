import { SetMetadata } from '@nestjs/common'
import { RATE_LIMIT_METADATA_KEY } from './rate-limit.constants'
import type { RateLimitOptions } from './rate-limit.types'

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_METADATA_KEY, options)

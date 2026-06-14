import { Module } from '@nestjs/common'
import { RateLimitGuard } from './rate-limit.guard'
import { RateLimitStore } from './rate-limit.store'

@Module({
  providers: [RateLimitStore, RateLimitGuard],
  exports: [RateLimitStore, RateLimitGuard],
})
export class RateLimitModule {}

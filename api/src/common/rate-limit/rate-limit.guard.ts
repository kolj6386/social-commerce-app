import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Response } from 'express'
import type { ShopifyProxyRequest } from '../../auth/shop.decorator'
import { RATE_LIMIT_DEFAULTS, RATE_LIMIT_METADATA_KEY } from './rate-limit.constants'
import { RateLimitStore } from './rate-limit.store'
import type { RateLimitOptions, RateLimitScope } from './rate-limit.types'
import { buildRateLimitKey } from './rate-limit.util'

const WRITE_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitStore: RateLimitStore,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (process.env.RATE_LIMIT_ENABLED === 'false') {
      return true
    }

    const request = context.switchToHttp().getRequest<ShopifyProxyRequest>()
    const response = context.switchToHttp().getResponse<Response>()
    const options = this.resolveOptions(context, request.method)

    const scope: RateLimitScope = options.scope ?? 'shop-ip'
    const key = buildRateLimitKey(request, scope)
    const result = this.rateLimitStore.checkRateLimit(key, options.limit, options.windowMs)

    response.setHeader('X-RateLimit-Limit', options.limit)
    response.setHeader('X-RateLimit-Remaining', result.remaining)

    if (!result.allowed) {
      response.setHeader('Retry-After', result.retryAfterSeconds)
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Try again later.',
          retryAfterSeconds: result.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    return true
  }

  private resolveOptions(context: ExecutionContext, method: string): RateLimitOptions {
    const fromDecorator = this.reflector.getAllAndOverride<RateLimitOptions | undefined>(
      RATE_LIMIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (fromDecorator) {
      return fromDecorator
    }

    if (WRITE_METHODS.has(method)) {
      return { ...RATE_LIMIT_DEFAULTS.STOREFRONT_WRITE, scope: 'shop-ip-write' }
    }

    return { ...RATE_LIMIT_DEFAULTS.STOREFRONT_READ, scope: 'shop-ip' }
  }
}

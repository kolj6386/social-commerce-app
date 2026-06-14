import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import { decode, verify } from 'jsonwebtoken'

@Injectable()
export class ShopifyAdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException()
    }

    const sessionToken = authHeader.replace('Bearer ', '').trim()
    const secret = this.config.get<string>('shopify.apiSecret')

    if (!secret) {
      throw new UnauthorizedException()
    }

    try {
      const decoded = decode(sessionToken, { complete: true })
      const payload =
        typeof decoded === 'object' && decoded && 'payload' in decoded
          ? (decoded.payload as Record<string, unknown>)
          : null

      const shopDomain = payload?.dest
      if (typeof shopDomain !== 'string' || !shopDomain.endsWith('.myshopify.com')) {
        throw new UnauthorizedException()
      }

      verify(sessionToken, secret, {
        algorithms: ['HS256'],
        issuer: this.config.get<string>('shopify.validIssuer'),
        audience: this.config.get<string>('shopify.validAudience'),
      })
      ;(request as Request & { shopifyAdmin?: Record<string, unknown> }).shopifyAdmin =
        payload ?? undefined
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}

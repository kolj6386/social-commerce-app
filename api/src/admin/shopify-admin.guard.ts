import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import { decode, verify } from 'jsonwebtoken'

/**
 * Validates Shopify App Bridge session tokens.
 *
 * Issuer is per-shop (`https://{shop}.myshopify.com/admin`) — never a fixed env value.
 * Audience is your app's client ID (same for every shop).
 */
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
    const audience =
      this.config.get<string>('shopify.validAudience') ?? this.config.get<string>('shopify.apiKey')

    if (!secret || !audience) {
      throw new UnauthorizedException()
    }

    try {
      const decoded = decode(sessionToken, { complete: true })
      const payload =
        typeof decoded === 'object' && decoded && 'payload' in decoded
          ? (decoded.payload as Record<string, unknown>)
          : null

      if (!payload) {
        throw new UnauthorizedException()
      }

      const dest = payload.dest
      const iss = payload.iss
      if (typeof dest !== 'string' || typeof iss !== 'string') {
        throw new UnauthorizedException()
      }

      const destUrl = new URL(dest)
      if (!destUrl.hostname.endsWith('.myshopify.com')) {
        throw new UnauthorizedException()
      }

      // Shopify issues iss as https://{shop}.myshopify.com/admin for that install.
      const expectedIssuer = `${destUrl.origin}/admin`
      if (iss !== expectedIssuer) {
        throw new UnauthorizedException()
      }

      verify(sessionToken, secret, {
        algorithms: ['HS256'],
        issuer: expectedIssuer,
        audience,
      })

      ;(request as Request & { shopifyAdmin?: Record<string, unknown> }).shopifyAdmin = payload
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}

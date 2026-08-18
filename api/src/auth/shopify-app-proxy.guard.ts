import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ShopifyProxyRequest } from './shop.decorator'
import {
  isProxyTimestampValid,
  parseShopFromProxyQuery,
  validateAppProxySignature,
} from './shopify-app-proxy.util'

@Injectable()
export class ShopifyAppProxyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ShopifyProxyRequest>()
    const query = request.query as Record<string, string | string[] | undefined>
    const secret = this.config.get<string>('shopify.apiSecret')

    if (!secret) {
      throw new UnauthorizedException()
    }

    const devBypass =
      process.env.NODE_ENV === 'development' && process.env.APP_PROXY_DEV_BYPASS === 'true'

    if (!devBypass) {
      if (!validateAppProxySignature(query, secret)) {
        throw new UnauthorizedException('Invalid app proxy signature')
      }

      if (!isProxyTimestampValid(query)) {
        throw new UnauthorizedException('App proxy timestamp expired')
      }
    }

    const shop = parseShopFromProxyQuery(query)
    if (!shop) {
      throw new UnauthorizedException('Invalid shop')
    }

    request.shopifyShop = shop
    return true
  }
}

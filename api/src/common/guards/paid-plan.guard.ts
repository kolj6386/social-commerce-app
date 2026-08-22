import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request } from 'express'
import type { ShopifyProxyRequest } from '../../auth/shop.decorator'
import { ShopService } from '../../shop/shop.service'

/**
 * Requires an active Shopify App Pricing plan on the shop.
 * Use on post *read* routes only — leave install/OAuth/webhooks ungated.
 */
@Injectable()
export class PaidPlanGuard implements CanActivate {
  constructor(private readonly shopService: ShopService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ShopifyProxyRequest & Request>()
    const shop =
      request.shopifyShop ??
      (typeof request.query?.shop === 'string' ? request.query.shop : undefined)

    if (!shop) {
      throw new UnauthorizedException('Shop is required')
    }

    const paid = await this.shopService.hasPaidPlan(shop)
    if (!paid) {
      throw new ForbiddenException('An active subscription is required to view posts')
    }

    return true
  }
}

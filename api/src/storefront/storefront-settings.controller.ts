import { Controller, Get, UseGuards } from '@nestjs/common'
import { Shop } from '../auth/shop.decorator'
import { ShopifyAppProxyGuard } from '../auth/shopify-app-proxy.guard'
import { ApiResponse } from '../common/api-response'
import { RateLimitGuard } from '../common/rate-limit/rate-limit.guard'
import { ShopService } from '../shop/shop.service'

@Controller('shopify-proxy/settings')
@UseGuards(ShopifyAppProxyGuard, RateLimitGuard)
export class StorefrontSettingsController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  async getSettings(@Shop() shop: string) {
    const settings = await this.shopService.getSettings(shop)
    return new ApiResponse({
      success: true,
      message: 'Settings retrieved successfully',
      data: {
        allowGuestPosting: settings.allowGuestPosting,
      },
    })
  }
}

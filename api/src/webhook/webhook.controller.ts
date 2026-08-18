import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import { ShopService } from '../shop/shop.service'
import { verifyShopifyWebhookHmac } from './shopify-webhook.util'

@Controller('webhooks/app')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly config: ConfigService,
    private readonly shopService: ShopService,
  ) {}

  @Post('uninstalled')
  @HttpCode(200)
  async uninstalled(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
  ) {
    if (!this.verifyHmac(req.rawBody, hmac)) {
      this.logger.warn(`[webhook] uninstalled — HMAC invalid — shop=${shopDomain}`)
      throw new UnauthorizedException()
    }

    this.logger.log(`[webhook] uninstalled — shop=${shopDomain}`)
    await this.shopService.purgeShopData(shopDomain)
    return { success: true }
  }

  private verifyHmac(rawBody: Buffer | undefined, hmacHeader: string): boolean {
    return verifyShopifyWebhookHmac(
      rawBody,
      hmacHeader,
      this.config.get<string>('shopify.apiSecret'),
    )
  }
}

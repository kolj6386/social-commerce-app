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
import { createHmac, timingSafeEqual } from 'crypto'
import type { Request } from 'express'
import { ShopService } from '../shop/shop.service'

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
    await this.shopService.markUninstalled(shopDomain)
    return { success: true }
  }

  /** Verifies the webhook payload HMAC against the app secret (base64, timing-safe). */
  private verifyHmac(rawBody: Buffer | undefined, hmacHeader: string): boolean {
    const secret = this.config.get<string>('shopify.apiSecret')
    if (!secret || !rawBody || !hmacHeader) {
      return false
    }

    const digest = createHmac('sha256', secret).update(rawBody).digest('base64')
    const expected = Buffer.from(digest)
    const received = Buffer.from(hmacHeader)
    return expected.length === received.length && timingSafeEqual(expected, received)
  }
}

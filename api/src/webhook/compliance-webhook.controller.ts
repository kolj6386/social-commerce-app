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
import type {
  CustomerDataRequestWebhook,
  CustomerRedactWebhook,
  ShopRedactWebhook,
} from '../shop/compliance.types'
import { parseWebhookJson, verifyShopifyWebhookHmac } from './shopify-webhook.util'

const COMPLIANCE_TOPICS = {
  CUSTOMER_DATA_REQUEST: 'customers/data_request',
  CUSTOMER_REDACT: 'customers/redact',
  SHOP_REDACT: 'shop/redact',
} as const

@Controller('webhooks')
export class ComplianceWebhookController {
  private readonly logger = new Logger(ComplianceWebhookController.name)

  constructor(
    private readonly config: ConfigService,
    private readonly shopService: ShopService,
  ) {}

  /** Mandatory GDPR/compliance webhooks — topic from X-Shopify-Topic header. */
  @Post()
  @HttpCode(200)
  async handleComplianceWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-shopify-hmac-sha256') hmac: string,
    @Headers('x-shopify-topic') topic: string,
    @Headers('x-shopify-shop-domain') shopDomain: string,
  ) {
    if (!this.verifyHmac(req.rawBody, hmac)) {
      this.logger.warn(`[compliance] HMAC invalid — topic=${topic}, shop=${shopDomain}`)
      throw new UnauthorizedException()
    }

    switch (topic) {
      case COMPLIANCE_TOPICS.CUSTOMER_DATA_REQUEST: {
        const payload = parseWebhookJson<CustomerDataRequestWebhook>(req.rawBody)
        if (!payload) {
          this.logger.warn(`[compliance] invalid JSON — topic=${topic}`)
          return { success: true }
        }
        await this.shopService.handleCustomerDataRequest(payload)
        return { success: true }
      }

      case COMPLIANCE_TOPICS.CUSTOMER_REDACT: {
        const payload = parseWebhookJson<CustomerRedactWebhook>(req.rawBody)
        if (!payload) {
          this.logger.warn(`[compliance] invalid JSON — topic=${topic}`)
          return { success: true }
        }
        await this.shopService.redactCustomerData(payload.shop_domain, payload.customer.id)
        return { success: true }
      }

      case COMPLIANCE_TOPICS.SHOP_REDACT: {
        const payload = parseWebhookJson<ShopRedactWebhook>(req.rawBody)
        if (!payload) {
          this.logger.warn(`[compliance] invalid JSON — topic=${topic}`)
          return { success: true }
        }
        await this.shopService.purgeShopData(payload.shop_domain)
        return { success: true }
      }

      default:
        this.logger.warn(`[compliance] unhandled topic=${topic}, shop=${shopDomain}`)
        return { success: true }
    }
  }

  private verifyHmac(rawBody: Buffer | undefined, hmacHeader: string): boolean {
    return verifyShopifyWebhookHmac(
      rawBody,
      hmacHeader,
      this.config.get<string>('shopify.apiSecret'),
    )
  }
}

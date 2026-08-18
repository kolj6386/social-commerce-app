import { Controller, Get, Logger, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import { PartnerApiService } from '../shop/partner-api.service'
import { ShopService } from '../shop/shop.service'

@Controller('app')
export class AppUiController {
  private readonly logger = new Logger(AppUiController.name)

  constructor(
    private readonly config: ConfigService,
    private readonly shopService: ShopService,
    private readonly partnerApi: PartnerApiService,
  ) {}

  /**
   * Embedded app entry / Shopify App Pricing return URL.
   *
   * When Shopify redirects after plan approval with `?shop=&plan_handle=`, we verify the
   * subscription via the Partner API, persist the plan, then forward to the frontend UI.
   * If verification fails, send the merchant back to the hosted pricing plans page.
   */
  @Get()
  async handleAppUi(@Req() req: Request, @Res() res: Response) {
    const shop = typeof req.query.shop === 'string' ? req.query.shop.trim() : ''
    const planHandle =
      typeof req.query.plan_handle === 'string' ? req.query.plan_handle.trim() : ''

    if (shop && planHandle) {
      return this.handleBillingReturn(req, res, shop, planHandle)
    }

    return this.redirectToFrontend(req, res)
  }

  private async handleBillingReturn(
    req: Request,
    res: Response,
    shopDomain: string,
    planHandle: string,
  ) {
    this.logger.log(`[app] billing return — shop=${shopDomain}, plan_handle=${planHandle}`)

    if (!this.partnerApi.isConfigured()) {
      this.logger.error(
        '[app] Partner API not configured — set SHOPIFY_PARTNER_ORG_ID, SHOPIFY_PARTNER_ACCESS_TOKEN, SHOPIFY_PARTNER_APP_ID',
      )
      return res.status(500).send('Billing configuration error')
    }

    const shopifyShopGid = await this.shopService.resolveShopifyShopGid(shopDomain)
    if (!shopifyShopGid) {
      this.logger.warn(`[app] could not resolve shop GID — redirecting to billing — shop=${shopDomain}`)
      return res.redirect(this.buildPricingPlansUrl(shopDomain))
    }

    try {
      const { valid, subscription } = await this.partnerApi.verifyPlanHandle(
        shopifyShopGid,
        planHandle,
      )

      if (!valid || !subscription) {
        this.logger.warn(
          `[app] subscription invalid or plan mismatch — shop=${shopDomain}, plan_handle=${planHandle}`,
        )
        return res.redirect(this.buildPricingPlansUrl(shopDomain))
      }

      const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null
      await this.shopService.updateSubscriptionPlan(shopDomain, planHandle, trialEndsAt)

      this.logger.log(
        `[app] billing verified — shop=${shopDomain}, plan=${planHandle}, redirecting to UI`,
      )
      return this.redirectToFrontend(req, res)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      this.logger.error(`[app] Partner API verification failed — shop=${shopDomain}, error=${message}`)
      return res.redirect(this.buildPricingPlansUrl(shopDomain))
    }
  }

  private redirectToFrontend(req: Request, res: Response) {
    const frontendUrl = this.config.get<string>('shopify.appUrl')

    if (!frontendUrl) {
      this.logger.error('[app] aborted — SHOPIFY_APP_URL is not configured')
      return res.status(500).send('Configuration error')
    }

    const targetUrl = new URL(
      req.originalUrl,
      frontendUrl.endsWith('/') ? frontendUrl : `${frontendUrl}/`,
    )

    this.logger.log(`[app] redirecting embedded frame to frontend UI — url=${targetUrl.toString()}`)
    return res.redirect(targetUrl.toString())
  }

  private buildPricingPlansUrl(shopDomain: string): string {
    const storeHandle = shopDomain.replace(/\.myshopify\.com$/i, '')
    const appHandle = this.config.get<string>('shopify.appHandle') ?? 'social-commerce-public-dev'
    return `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`
  }
}

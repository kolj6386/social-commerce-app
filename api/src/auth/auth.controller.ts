import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import { generateNonce, validateShopifyHmac } from './shopify-hmac.util'
import { ShopifyCallbackQueryDto, ShopifyInstallQueryDto } from './dto/shopify-install-query.dto'

interface ShopifyTokenResponse {
  access_token: string
  scope: string
}

@Controller('auth/shopify')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private readonly config: ConfigService) {}

  @Get('authenticateStore')
  authenticateStore() {
    // TODO: verify store access (legacy endpoint stub)
    return { success: true }
  }

  @Get('redirect')
  redirectToShopify(@Query() query: ShopifyInstallQueryDto, @Res() res: Response) {
    const clientId = this.config.get<string>('shopify.apiKey')
    const redirectUri = this.config.get<string>('shopify.oauthRedirectUri')
    const scope = 'write_products'
    const nonce = generateNonce()

    this.logger.log('hitting redirect url')

    const shopifyUrl = new URL(`https://${query.shop}/admin/oauth/authorize`)
    shopifyUrl.searchParams.set('client_id', clientId ?? '')
    shopifyUrl.searchParams.set('redirect_uri', redirectUri ?? '')
    shopifyUrl.searchParams.set('scope', scope)
    shopifyUrl.searchParams.set('state', nonce)

    return res.redirect(shopifyUrl.toString())
  }

  @Get('callback')
  async callback(@Query() query: ShopifyCallbackQueryDto, @Req() req: Request, @Res() res: Response) {
    this.logger.log('hitting callback url')

    const clientSecret = this.config.get<string>('shopify.apiSecret')
    if (!clientSecret || !validateShopifyHmac(req.query as Record<string, string>, clientSecret)) {
      return res.status(400).send('HMAC validation failed.')
    }

    const clientId = this.config.get<string>('shopify.apiKey')
    if (!clientId || !clientSecret) {
      return res.status(400).send('Missing app keys')
    }

    const tokenResponse = await fetch(`https://${query.shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: query.code,
      }),
    })

    if (!tokenResponse.ok) {
      return res.status(tokenResponse.status).send('Failed to retrieve access token')
    }

    const tokenJson = (await tokenResponse.json()) as ShopifyTokenResponse
    this.logger.log(`Shopify token scope: ${tokenJson.scope}`)
    // TODO: persist access token and shop for session handling

    const appUrl = this.config.get<string>('shopify.appUrl')
    res.removeHeader('X-Frame-Options')
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors https://${query.shop} https://admin.shopify.com https://*.spin.dev;`,
    )

    const redirectTarget = `${appUrl}?shop=${query.shop}&host=${encodeURIComponent(query.host)}&embedded=1`
    this.logger.log(`sending redirect ${redirectTarget}`)
    return res.redirect(redirectTarget)
  }
}

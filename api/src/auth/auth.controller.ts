import { Controller, Get, Logger, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import { ShopService } from '../shop/shop.service'
import { ShopifyAdminGuard } from '../admin/shopify-admin.guard'
import { generateNonce, validateShopifyHmac } from './shopify-hmac.util'
import { ShopifyCallbackQueryDto, ShopifyInstallQueryDto } from './dto/shopify-install-query.dto'

interface ShopifyTokenResponse {
  access_token: string
  scope: string
}

@Controller('auth/shopify')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly config: ConfigService,
    private readonly shopService: ShopService,
  ) {}

  /** App entry — Shopify loads this as application_url with ?shop=&host=&embedded=1 */
  @Get()
  async entry(@Query() query: ShopifyInstallQueryDto, @Res() res: Response) {
    this.logger.log(`[entry] start — shop=${query.shop}, host=${query.host ?? '(none)'}`)

    if (!query.shop) {
      this.logger.warn('[entry] aborted — missing shop query param')
      return res.status(400).send('Missing shop parameter')
    }

    const hasToken = await this.shopService.hasActiveInstall(query.shop)

    if (!hasToken) {
      const oauthUrl = this.buildOAuthUrl(query.shop)

      // Shopify refuses to render its OAuth screen inside the embedded admin iframe, so a
      // server-side redirect just blanks out and loops. When loaded embedded (host present),
      // break out to the top-level window via App Bridge instead.
      if (query.host) {
        this.logger.log(`[entry] no token + embedded — breaking out of iframe for OAuth — shop=${query.shop}`)
        return this.renderIframeBreakout(res, oauthUrl, query.shop)
      }

      this.logger.log(`[entry] no token (top-level) — redirecting to OAuth — shop=${query.shop}`)
      return res.redirect(oauthUrl)
    }

    const uiUrl = this.buildAppUiUrl(query.shop, query.host)
    this.logger.log(`[entry] already installed — redirecting to UI — shop=${query.shop}`)
    return res.redirect(uiUrl)
  }

  /**
   * Called by the frontend (with a valid App Bridge session token) right after it loads, so the
   * backend gets its own offline access token and records the install in our DB. This replaces the
   * old OAuth install hook now that the frontend is the embedded entry point.
   */
  @Post('register')
  @UseGuards(ShopifyAdminGuard)
  async register(@Req() req: Request, @Res() res: Response) {
    const payload = (req as Request & { shopifyAdmin?: Record<string, unknown> }).shopifyAdmin
    const dest = payload?.dest

    if (typeof dest !== 'string') {
      this.logger.warn('[register] aborted — session token missing dest claim')
      return res.status(400).json({ success: false, message: 'Invalid session token' })
    }

    const shopDomain = new URL(dest).host
    const sessionToken = (req.headers.authorization ?? '').replace('Bearer ', '').trim()

    try {
      const { accessToken, scope } = await this.exchangeToken(shopDomain, sessionToken)
      const shop = await this.shopService.upsertOnInstall(shopDomain, accessToken, scope)
      this.logger.log(`[register] shop registered via token exchange — shop=${shopDomain}, shopId=${shop.id}`)
      return res.json({ success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      this.logger.error(`[register] token exchange failed — shop=${shopDomain}, error=${message}`)
      return res.status(500).json({ success: false, message: 'Registration failed' })
    }
  }

  @Get('redirect')
  redirectToShopify(@Query() query: ShopifyInstallQueryDto, @Res() res: Response) {
    this.logger.log(`[redirect] start — shop=${query.shop}`)

    const oauthUrl = this.buildOAuthUrl(query.shop)

    // Same iframe constraint as entry(): break out when embedded.
    if (query.host) {
      this.logger.log(`[redirect] embedded — breaking out of iframe for OAuth — shop=${query.shop}`)
      return this.renderIframeBreakout(res, oauthUrl, query.shop)
    }

    this.logger.log(`[redirect] sending merchant to Shopify OAuth — shop=${query.shop}`)
    return res.redirect(oauthUrl)
  }

  @Get('callback')
  async callback(@Query() query: ShopifyCallbackQueryDto, @Req() req: Request, @Res() res: Response) {
    this.logger.log(
      `[callback] start — shop=${query.shop}, host=${query.host}, hasCode=${!!query.code}`,
    )

    const clientSecret = this.config.get<string>('shopify.apiSecret')
    const hmacValid = !!clientSecret && validateShopifyHmac(req.query as Record<string, string>, clientSecret)

    if (!clientSecret) {
      this.logger.error('[callback] aborted — SHOPIFY_API_SECRET is not configured')
      return res.status(400).send('HMAC validation failed.')
    }

    if (!hmacValid) {
      this.logger.warn(`[callback] aborted — HMAC validation failed for shop=${query.shop}`)
      return res.status(400).send('HMAC validation failed.')
    }

    this.logger.log(`[callback] HMAC valid — shop=${query.shop}`)

    const clientId = this.config.get<string>('shopify.apiKey')
    if (!clientId || !clientSecret) {
      this.logger.error('[callback] aborted — missing SHOPIFY_API_KEY or SHOPIFY_API_SECRET')
      return res.status(400).send('Missing app keys')
    }

    this.logger.log(`[callback] exchanging code for access token — shop=${query.shop}`)
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
      const errorBody = await tokenResponse.text()
      this.logger.error(
        `[callback] token exchange failed — shop=${query.shop}, status=${tokenResponse.status}, body=${errorBody}`,
      )
      return res.status(tokenResponse.status).send('Failed to retrieve access token')
    }

    const tokenJson = (await tokenResponse.json()) as ShopifyTokenResponse
    this.logger.log(`[callback] token received — shop=${query.shop}, scope=${tokenJson.scope}`)

    const shop = await this.shopService.upsertOnInstall(query.shop, tokenJson.access_token, tokenJson.scope)
    this.logger.log(`[callback] shop saved — shop=${query.shop}, shopId=${shop.id}, isActive=${shop.isActive}`)

    // OAuth ran at the top level (we broke out of the iframe), so this callback is a full-page
    // load on the backend domain — NOT inside Shopify admin. Send the merchant back into the
    // embedded admin app. Admin then re-loads application_url (this controller's entry), which
    // now finds a token and forwards the iframe to the frontend UI (/app).
    const apiKey = this.config.get<string>('shopify.apiKey') ?? ''
    const reembedUrl = `https://${query.shop}/admin/apps/${apiKey}`
    this.logger.log(`[callback] complete — re-embedding into admin — shop=${query.shop}, url=${reembedUrl}`)
    return res.redirect(reembedUrl)
  }

  /**
   * Exchanges a validated App Bridge session token for an offline access token (OAuth token
   * exchange grant) — no redirect dance needed. https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange
   */
  private async exchangeToken(
    shop: string,
    sessionToken: string,
  ): Promise<{ accessToken: string; scope: string }> {
    const clientId = this.config.get<string>('shopify.apiKey')
    const clientSecret = this.config.get<string>('shopify.apiSecret')

    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: sessionToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
        requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`token exchange ${response.status}: ${body}`)
    }

    const json = (await response.json()) as ShopifyTokenResponse
    return { accessToken: json.access_token, scope: json.scope }
  }

  /** Builds the Shopify OAuth authorization URL the merchant must be sent to (top level). */
  private buildOAuthUrl(shop: string): string {
    const clientId = this.config.get<string>('shopify.apiKey')
    const redirectUri = this.config.get<string>('shopify.oauthRedirectUri')
    const scope = 'write_products'
    const nonce = generateNonce()

    this.logger.log(
      `[oauth] config — hasApiKey=${!!clientId}, redirectUri=${redirectUri}, scope=${scope}`,
    )

    const shopifyUrl = new URL(`https://${shop}/admin/oauth/authorize`)
    shopifyUrl.searchParams.set('client_id', clientId ?? '')
    shopifyUrl.searchParams.set('redirect_uri', redirectUri ?? '')
    shopifyUrl.searchParams.set('scope', scope)
    shopifyUrl.searchParams.set('state', nonce)
    return shopifyUrl.toString()
  }

  /**
   * Returns an HTML page that escapes the Shopify admin iframe and performs the OAuth navigation
   * on the top-level window via App Bridge. Required because Shopify blocks its OAuth screen from
   * rendering inside an iframe.
   */
  private renderIframeBreakout(res: Response, targetUrl: string, shop: string) {
    const apiKey = this.config.get<string>('shopify.apiKey') ?? ''

    res.removeHeader('X-Frame-Options')
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors https://${shop} https://admin.shopify.com https://*.spin.dev;`,
    )
    res.setHeader('Content-Type', 'text/html; charset=utf-8')

    const html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="shopify-api-key" content="${apiKey}" />
          <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        </head>
        <body>
          <script>
            // App Bridge overrides window.open so open(url, "_top") navigates the admin's top window.
            var target = ${JSON.stringify(targetUrl)};
            if (window.top === window.self) {
              window.location.href = target;
            } else {
              open(target, "_top");
            }
          </script>
        </body>
      </html>`

    return res.status(200).send(html)
  }

  private buildAppUiUrl(shop: string, host?: string): string {
    const appUrl = this.config.get<string>('shopify.appUrl') ?? ''
    const appUiPath = this.config.get<string>('shopify.appUiPath') ?? '/app'
    const uiUrl = new URL(appUiPath, appUrl.endsWith('/') ? appUrl : `${appUrl}/`)
    uiUrl.searchParams.set('shop', shop)
    if (host) {
      uiUrl.searchParams.set('host', host)
    }
    uiUrl.searchParams.set('embedded', '1')
    return uiUrl.toString()
  }
}

import { Controller, Get, Logger, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'

@Controller('app')
export class AppUiController {
  private readonly logger = new Logger(AppUiController.name)

  constructor(private readonly config: ConfigService) {}

  @Get()
  handleAppUi(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = this.config.get<string>('shopify.appUrl')

    if (!frontendUrl) {
      this.logger.error('[app] aborted — SHOPIFY_APP_URL is not configured')
      return res.status(500).send('Configuration error')
    }

    const targetUrl = new URL(req.originalUrl, frontendUrl.endsWith('/') ? frontendUrl : `${frontendUrl}/`)

    this.logger.log(`[app] redirecting embedded frame to frontend UI — url=${targetUrl.toString()}`)
    return res.redirect(targetUrl.toString())
  }
}

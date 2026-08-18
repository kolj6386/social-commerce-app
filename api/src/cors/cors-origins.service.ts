import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Shop } from '../entities/shop.entity'

@Injectable()
export class CorsOriginsService implements OnModuleInit {
  private readonly logger = new Logger(CorsOriginsService.name)
  private readonly allowedOrigins = new Set<string>()

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly config: ConfigService,
  ) {
    this.registerStaticOrigins()
  }

  async onModuleInit(): Promise<void> {
    await this.loadFromDatabase()
  }

  addShop(shopDomain: string): void {
    this.allowedOrigins.add(this.toOrigin(shopDomain))
  }

  removeShop(shopDomain: string): void {
    this.allowedOrigins.delete(this.toOrigin(shopDomain))
  }

  isAllowed(origin: string | undefined): boolean {
    if (!origin) {
      return true
    }

    if (this.allowedOrigins.has(origin)) {
      return true
    }

    if (process.env.NODE_ENV === 'development') {
      try {
        const { hostname } = new URL(origin)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return true
        }
      } catch {
        return false
      }
    }

    return false
  }

  private async loadFromDatabase(): Promise<void> {
    const shops = await this.shopRepository.find({
      select: ['shopDomain'],
    })

    for (const shop of shops) {
      this.addShop(shop.shopDomain)
    }

    this.logger.log(
      `CORS allowlist ready — ${shops.length} shop(s), ${this.allowedOrigins.size} total origin(s)`,
    )
  }

  private registerStaticOrigins(): void {
    this.allowedOrigins.add('https://admin.shopify.com')

    const appUrl = this.config.get<string>('shopify.appUrl')
    if (appUrl) {
      this.addOriginFromUrl(appUrl)
    }

    const backendUrl = this.config.get<string>('shopify.backendUrl')
    if (backendUrl) {
      this.addOriginFromUrl(backendUrl)
    }

    const extra = process.env.CORS_EXTRA_ORIGINS
    if (extra) {
      for (const origin of extra.split(',')) {
        const trimmed = origin.trim()
        if (trimmed) {
          this.allowedOrigins.add(trimmed)
        }
      }
    }
  }

  private addOriginFromUrl(url: string): void {
    try {
      this.allowedOrigins.add(new URL(url).origin)
    } catch {
      this.logger.warn(`Skipping invalid CORS URL in config: ${url}`)
    }
  }

  private toOrigin(shopDomain: string): string {
    const host = shopDomain.replace(/^https?:\/\//, '').split('/')[0]
    return `https://${host}`
  }
}

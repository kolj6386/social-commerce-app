import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Shop } from '../entities/shop.entity'

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name)

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async hasActiveInstall(shopDomain: string): Promise<boolean> {
    const shop = await this.shopRepository.findOne({ where: { shopDomain, isActive: true } })
    return !!shop?.accessToken
  }

  async upsertOnInstall(shopDomain: string, accessToken: string, scopes: string): Promise<Shop> {
    const now = new Date()
    const existing = await this.shopRepository.findOne({ where: { shopDomain } })

    if (existing) {
      existing.accessToken = accessToken
      existing.scopes = scopes
      existing.isActive = true
      existing.uninstalledAt = null
      existing.updatedAt = now

      const saved = await this.shopRepository.save(existing)
      this.logger.log(`Reinstalled shop: ${shopDomain}`)
      return saved
    }

    const shop = this.shopRepository.create({
      shopDomain,
      accessToken,
      scopes,
      isActive: true,
      installedAt: now,
      uninstalledAt: null,
      updatedAt: now,
    })

    const saved = await this.shopRepository.save(shop)
    this.logger.log(`Installed new shop: ${shopDomain}`)
    return saved
  }

  async markUninstalled(shopDomain: string): Promise<void> {
    const existing = await this.shopRepository.findOne({ where: { shopDomain } })

    if (!existing) {
      this.logger.warn(`Uninstall received for unknown shop: ${shopDomain}`)
      return
    }

    const now = new Date()
    existing.isActive = false
    existing.uninstalledAt = now
    existing.updatedAt = now

    await this.shopRepository.save(existing)
    this.logger.log(`Uninstalled shop: ${shopDomain}`)
  }
}

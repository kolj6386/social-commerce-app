import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { TableNames } from './table-names'

@Entity({ name: TableNames.Shops })
export class Shop {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number

  @Column({ name: 'ShopDomain', unique: true })
  shopDomain: string

  // Encrypted at rest when TOKEN_ENCRYPTION_KEY is set (see secret-crypto.ts).
  @Column({ name: 'AccessToken' })
  accessToken: string

  /** Refresh token for expiring offline access tokens (`shprt_...`). */
  @Column({ name: 'RefreshToken', type: 'varchar', nullable: true })
  refreshToken: string | null

  @Column({ name: 'AccessTokenExpiresAt', type: 'timestamp', nullable: true })
  accessTokenExpiresAt: Date | null

  @Column({ name: 'RefreshTokenExpiresAt', type: 'timestamp', nullable: true })
  refreshTokenExpiresAt: Date | null

  @Column({ name: 'Scopes' })
  scopes: string

  /** Admin API shop GID — `gid://shopify/Shop/...` — used for Partner API billing lookups. */
  @Column({ name: 'ShopifyShopGid', type: 'varchar', nullable: true })
  shopifyShopGid: string | null

  /** Active Shopify App Pricing plan handle, e.g. `my_basic_plan`. */
  @Column({ name: 'SubscriptionPlan', type: 'varchar', nullable: true })
  subscriptionPlan: string | null

  @Column({ name: 'TrialEndsAt', type: 'timestamp', nullable: true })
  trialEndsAt: Date | null

  @Column({ name: 'IsActive' })
  isActive: boolean

  @Column({ name: 'InstalledAt', type: 'timestamp' })
  installedAt: Date

  @Column({ name: 'UninstalledAt', type: 'timestamp', nullable: true })
  uninstalledAt: Date | null

  @Column({ name: 'UpdatedAt', type: 'timestamp' })
  updatedAt: Date
}

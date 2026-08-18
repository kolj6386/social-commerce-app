import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { CorsOriginsService } from '../cors/cors-origins.service'
import { Shop } from '../entities/shop.entity'
import type { CustomerDataRequestWebhook } from './compliance.types'
import {
  type ShopTokenCredentials,
  type ShopifyOfflineTokenResponse,
  toShopTokenCredentials,
} from './shop-token.types'

interface QueryResultWithCount {
  1?: number
}

const affectedRows = (result: unknown): number => {
  if (Array.isArray(result)) {
    const maybeCount = (result as QueryResultWithCount[])[1]
    if (typeof maybeCount === 'number') {
      return maybeCount
    }
  }
  return 0
}

/** Refresh a minute early so in-flight Admin calls don't race expiry. */
const ACCESS_TOKEN_REFRESH_SKEW_MS = 60_000

export interface CustomerDataExport {
  posts: Record<string, unknown>[]
  comments: Record<string, unknown>[]
  postReactions: Record<string, unknown>[]
  commentReactions: Record<string, unknown>[]
  postViews: Record<string, unknown>[]
}

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name)

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly dataSource: DataSource,
    private readonly corsOrigins: CorsOriginsService,
    private readonly config: ConfigService,
  ) {}

  async hasActiveInstall(shopDomain: string): Promise<boolean> {
    const shop = await this.shopRepository.findOne({ where: { shopDomain } })
    return !!shop?.accessToken
  }

  async findByDomain(shopDomain: string): Promise<Shop | null> {
    return this.shopRepository.findOne({ where: { shopDomain } })
  }

  async upsertOnInstall(shopDomain: string, credentials: ShopTokenCredentials): Promise<Shop> {
    const now = new Date()
    const existing = await this.shopRepository.findOne({ where: { shopDomain } })

    if (existing) {
      this.applyTokenCredentials(existing, credentials)
      existing.updatedAt = now

      const saved = await this.shopRepository.save(existing)
      this.corsOrigins.addShop(shopDomain)
      this.logger.log(`Reinstalled shop: ${shopDomain}`)
      return saved
    }

    const shop = this.shopRepository.create({
      shopDomain,
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      accessTokenExpiresAt: credentials.accessTokenExpiresAt,
      refreshTokenExpiresAt: credentials.refreshTokenExpiresAt,
      scopes: credentials.scopes,
      shopifyShopGid: null,
      subscriptionPlan: null,
      trialEndsAt: null,
      isActive: true,
      installedAt: now,
      uninstalledAt: null,
      updatedAt: now,
    })

    const saved = await this.shopRepository.save(shop)
    this.corsOrigins.addShop(shopDomain)
    this.logger.log(`Installed new shop: ${shopDomain}`)
    return saved
  }

  /**
   * Returns a usable Admin API access token, refreshing (or migrating) when needed.
   * Public apps must use expiring offline tokens.
   */
  async getValidAccessToken(shopDomain: string): Promise<string | null> {
    const shop = await this.shopRepository.findOne({ where: { shopDomain } })
    if (!shop?.accessToken) {
      return null
    }

    const needsRefresh =
      !shop.refreshToken ||
      !shop.accessTokenExpiresAt ||
      shop.accessTokenExpiresAt.getTime() <= Date.now() + ACCESS_TOKEN_REFRESH_SKEW_MS

    if (!needsRefresh) {
      return shop.accessToken
    }

    if (shop.refreshToken) {
      try {
        const refreshed = await this.refreshOfflineToken(shopDomain, shop.refreshToken)
        this.applyTokenCredentials(shop, toShopTokenCredentials(refreshed))
        shop.updatedAt = new Date()
        await this.shopRepository.save(shop)
        this.logger.log(`[token] refreshed offline token — shop=${shopDomain}`)
        return shop.accessToken
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        this.logger.warn(`[token] refresh failed — shop=${shopDomain}, error=${message}`)
      }
    }

    // Legacy non-expiring token (or refresh failed): one-time migrate via token exchange.
    try {
      const migrated = await this.migrateToExpiringOfflineToken(shopDomain, shop.accessToken)
      this.applyTokenCredentials(shop, toShopTokenCredentials(migrated))
      shop.updatedAt = new Date()
      await this.shopRepository.save(shop)
      this.logger.log(`[token] migrated to expiring offline token — shop=${shopDomain}`)
      return shop.accessToken
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      this.logger.error(`[token] migrate to expiring failed — shop=${shopDomain}, error=${message}`)
      return null
    }
  }

  async updateSubscriptionPlan(
    shopDomain: string,
    planHandle: string,
    trialEndsAt: Date | null,
  ): Promise<Shop | null> {
    const shop = await this.shopRepository.findOne({ where: { shopDomain } })
    if (!shop) {
      this.logger.warn(`[billing] cannot persist plan — unknown shop=${shopDomain}`)
      return null
    }

    shop.subscriptionPlan = planHandle
    shop.trialEndsAt = trialEndsAt
    shop.updatedAt = new Date()
    const saved = await this.shopRepository.save(shop)
    this.logger.log(`[billing] plan saved — shop=${shopDomain}, plan=${planHandle}`)
    return saved
  }

  /**
   * Returns the Admin API shop GID (`gid://shopify/Shop/...`) needed by the Partner API.
   * Caches it on the shop row after the first successful Admin GraphQL lookup.
   */
  async resolveShopifyShopGid(shopDomain: string): Promise<string | null> {
    const shop = await this.shopRepository.findOne({ where: { shopDomain } })
    if (!shop) {
      this.logger.warn(`[billing] unknown shop=${shopDomain}`)
      return null
    }

    if (shop.shopifyShopGid) {
      return shop.shopifyShopGid
    }

    const accessToken = await this.getValidAccessToken(shopDomain)
    if (!accessToken) {
      this.logger.warn(`[billing] no usable access token for shop=${shopDomain}`)
      return null
    }

    const gid = await this.fetchShopifyShopGid(shopDomain, accessToken)
    if (!gid) {
      return null
    }

    const latest = await this.shopRepository.findOne({ where: { shopDomain } })
    if (!latest) {
      return gid
    }

    latest.shopifyShopGid = gid
    latest.updatedAt = new Date()
    await this.shopRepository.save(latest)
    return gid
  }

  private applyTokenCredentials(shop: Shop, credentials: ShopTokenCredentials): void {
    shop.accessToken = credentials.accessToken
    shop.refreshToken = credentials.refreshToken
    shop.accessTokenExpiresAt = credentials.accessTokenExpiresAt
    shop.refreshTokenExpiresAt = credentials.refreshTokenExpiresAt
    shop.scopes = credentials.scopes
  }

  private async refreshOfflineToken(
    shopDomain: string,
    refreshToken: string,
  ): Promise<ShopifyOfflineTokenResponse> {
    const clientId = this.config.get<string>('shopify.apiKey')
    const clientSecret = this.config.get<string>('shopify.apiSecret')
    if (!clientId || !clientSecret) {
      throw new Error('Missing SHOPIFY_API_KEY or SHOPIFY_API_SECRET')
    }

    const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`refresh ${response.status}: ${body}`)
    }

    return (await response.json()) as ShopifyOfflineTokenResponse
  }

  /** Irreversible migration of a non-expiring offline token to an expiring one. */
  private async migrateToExpiringOfflineToken(
    shopDomain: string,
    nonExpiringToken: string,
  ): Promise<ShopifyOfflineTokenResponse> {
    const clientId = this.config.get<string>('shopify.apiKey')
    const clientSecret = this.config.get<string>('shopify.apiSecret')
    if (!clientId || !clientSecret) {
      throw new Error('Missing SHOPIFY_API_KEY or SHOPIFY_API_SECRET')
    }

    const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: nonExpiringToken,
        subject_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
        requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
        expiring: '1',
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`migrate ${response.status}: ${body}`)
    }

    return (await response.json()) as ShopifyOfflineTokenResponse
  }

  private async fetchShopifyShopGid(shopDomain: string, accessToken: string): Promise<string | null> {
    const apiVersion = this.config.get<string>('shopify.adminApiVersion') ?? '2025-10'
    const endpoint = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query: '{ shop { id } }' }),
      })

      if (!response.ok) {
        const body = await response.text()
        this.logger.error(
          `[billing] Admin shop id lookup failed — shop=${shopDomain}, status=${response.status}, body=${body}`,
        )
        return null
      }

      const json = (await response.json()) as {
        data?: { shop?: { id?: string } }
        errors?: Array<{ message: string }>
      }

      if (json.errors?.length) {
        this.logger.error(
          `[billing] Admin shop id GraphQL errors — shop=${shopDomain}, errors=${json.errors.map((e) => e.message).join('; ')}`,
        )
        return null
      }

      const gid = json.data?.shop?.id
      if (!gid) {
        this.logger.warn(`[billing] Admin shop id missing in response — shop=${shopDomain}`)
        return null
      }

      this.logger.log(`[billing] resolved shop GID — shop=${shopDomain}, gid=${gid}`)
      return gid
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      this.logger.error(`[billing] Admin shop id lookup threw — shop=${shopDomain}, error=${message}`)
      return null
    }
  }

  async deleteShop(shopDomain: string): Promise<void> {
    const existing = await this.shopRepository.findOne({ where: { shopDomain } })

    if (!existing) {
      this.logger.warn(`Uninstall received for unknown shop: ${shopDomain}`)
      return
    }

    await this.shopRepository.remove(existing)
    this.corsOrigins.removeShop(shopDomain)
    this.logger.log(`Deleted shop: ${shopDomain}`)
  }

  async purgeShopData(shopDomain: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const commentReactionsResult = await manager.query(
        `
        DELETE FROM "CommentReactions"
        WHERE "CommentId" IN (SELECT "Id" FROM "Comments" WHERE "ShopId" = $1)`,
        [shopDomain],
      )

      const postReactionsResult = await manager.query(
        `
        DELETE FROM "PostReactions"
        WHERE "PostId" IN (SELECT "Id" FROM "Posts" WHERE "ShopId" = $1)`,
        [shopDomain],
      )

      const postViewsResult = await manager.query(
        `
        DELETE FROM "PostViews"
        WHERE "PostId" IN (SELECT "Id" FROM "Posts" WHERE "ShopId" = $1)`,
        [shopDomain],
      )

      const commentsResult = await manager.query(`DELETE FROM "Comments" WHERE "ShopId" = $1`, [
        shopDomain,
      ])
      const postsResult = await manager.query(`DELETE FROM "Posts" WHERE "ShopId" = $1`, [
        shopDomain,
      ])
      const shopsResult = await manager.query(`DELETE FROM "Shops" WHERE "ShopDomain" = $1`, [
        shopDomain,
      ])

      this.logger.log(
        `[uninstall] purged shop data — shop=${shopDomain}, commentReactions=${affectedRows(commentReactionsResult)}, postReactions=${affectedRows(postReactionsResult)}, postViews=${affectedRows(postViewsResult)}, comments=${affectedRows(commentsResult)}, posts=${affectedRows(postsResult)}, shops=${affectedRows(shopsResult)}`,
      )
    })

    this.corsOrigins.removeShop(shopDomain)
  }

  async handleCustomerDataRequest(payload: CustomerDataRequestWebhook): Promise<CustomerDataExport> {
    const shopDomain = payload.shop_domain
    const userId = payload.customer.id
    const exportData = await this.exportCustomerData(shopDomain, userId)

    this.logger.log(
      `[compliance] customers/data_request — shop=${shopDomain}, customerId=${userId}, dataRequestId=${payload.data_request.id}, posts=${exportData.posts.length}, comments=${exportData.comments.length}`,
    )

    return exportData
  }

  async exportCustomerData(shopDomain: string, userId: number): Promise<CustomerDataExport> {
    const [posts, comments, postReactions, commentReactions, postViews] = await Promise.all([
      this.dataSource.query<Record<string, unknown>[]>(
        `SELECT * FROM "Posts" WHERE "ShopId" = $1 AND "UserId" = $2`,
        [shopDomain, userId],
      ),
      this.dataSource.query<Record<string, unknown>[]>(
        `SELECT * FROM "Comments" WHERE "ShopId" = $1 AND "UserId" = $2`,
        [shopDomain, userId],
      ),
      this.dataSource.query<Record<string, unknown>[]>(
        `
        SELECT pr.*
        FROM "PostReactions" pr
        INNER JOIN "Posts" p ON p."Id" = pr."PostId"
        WHERE p."ShopId" = $1 AND pr."UserId" = $2`,
        [shopDomain, userId],
      ),
      this.dataSource.query<Record<string, unknown>[]>(
        `
        SELECT cr.*
        FROM "CommentReactions" cr
        INNER JOIN "Comments" c ON c."Id" = cr."CommentId"
        WHERE c."ShopId" = $1 AND cr."UserId" = $2`,
        [shopDomain, userId],
      ),
      this.dataSource.query<Record<string, unknown>[]>(
        `
        SELECT pv.*
        FROM "PostViews" pv
        INNER JOIN "Posts" p ON p."Id" = pv."PostId"
        WHERE p."ShopId" = $1 AND pv."UserId" = $2`,
        [shopDomain, userId],
      ),
    ])

    return {
      posts: posts ?? [],
      comments: comments ?? [],
      postReactions: postReactions ?? [],
      commentReactions: commentReactions ?? [],
      postViews: postViews ?? [],
    }
  }

  async redactCustomerData(shopDomain: string, userId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const commentReactionsResult = await manager.query(
        `
        DELETE FROM "CommentReactions" cr
        USING "Comments" c
        WHERE cr."CommentId" = c."Id"
          AND c."ShopId" = $1
          AND cr."UserId" = $2`,
        [shopDomain, userId],
      )

      const postReactionsResult = await manager.query(
        `
        DELETE FROM "PostReactions" pr
        USING "Posts" p
        WHERE pr."PostId" = p."Id"
          AND p."ShopId" = $1
          AND pr."UserId" = $2`,
        [shopDomain, userId],
      )

      const postViewsResult = await manager.query(
        `
        DELETE FROM "PostViews" pv
        USING "Posts" p
        WHERE pv."PostId" = p."Id"
          AND p."ShopId" = $1
          AND pv."UserId" = $2`,
        [shopDomain, userId],
      )

      const commentsResult = await manager.query(
        `DELETE FROM "Comments" WHERE "ShopId" = $1 AND "UserId" = $2`,
        [shopDomain, userId],
      )

      const postsResult = await manager.query(
        `DELETE FROM "Posts" WHERE "ShopId" = $1 AND "UserId" = $2`,
        [shopDomain, userId],
      )

      this.logger.log(
        `[compliance] customers/redact — shop=${shopDomain}, userId=${userId}, commentReactions=${affectedRows(commentReactionsResult)}, postReactions=${affectedRows(postReactionsResult)}, postViews=${affectedRows(postViewsResult)}, comments=${affectedRows(commentsResult)}, posts=${affectedRows(postsResult)}`,
      )
    })
  }
}

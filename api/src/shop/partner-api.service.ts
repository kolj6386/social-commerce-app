import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface ActiveSubscriptionItem {
  handle: string | null
  description: string | null
}

export interface ActiveSubscription {
  billingPeriod: string
  cancelAtEndOfCycle: boolean
  trialEndsAt: string | null
  items: ActiveSubscriptionItem[]
  shop: {
    id: string
    myshopifyDomain: string
  } | null
}

interface PartnerGraphqlResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

const ACTIVE_SUBSCRIPTION_QUERY = `
  query ActiveSubscription($appId: ID!, $shopId: ID!) {
    activeSubscription(appId: $appId, shopId: $shopId) {
      billingPeriod
      cancelAtEndOfCycle
      trialEndsAt
      items {
        handle
        description
      }
      shop {
        id
        myshopifyDomain
      }
    }
  }
`

@Injectable()
export class PartnerApiService {
  private readonly logger = new Logger(PartnerApiService.name)

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return !!(
      this.config.get<string>('shopify.partner.orgId') &&
      this.config.get<string>('shopify.partner.accessToken') &&
      this.config.get<string>('shopify.partner.appId')
    )
  }

  async getActiveSubscription(shopifyShopGid: string): Promise<ActiveSubscription | null> {
    const orgId = this.config.get<string>('shopify.partner.orgId')
    const accessToken = this.config.get<string>('shopify.partner.accessToken')
    const appId = this.config.get<string>('shopify.partner.appId')
    const apiVersion = this.config.get<string>('shopify.partner.apiVersion') ?? '2026-07'

    if (!orgId || !accessToken || !appId) {
      throw new Error('Partner API is not configured')
    }

    const endpoint = `https://partners.shopify.com/${orgId}/api/${apiVersion}/graphql.json`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: ACTIVE_SUBSCRIPTION_QUERY,
        variables: { appId, shopId: shopifyShopGid },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Partner API HTTP ${response.status}: ${body}`)
    }

    const json = (await response.json()) as PartnerGraphqlResponse<{
      activeSubscription: ActiveSubscription | null
    }>

    if (json.errors?.length) {
      const message = json.errors.map((e) => e.message).join('; ')
      throw new Error(`Partner API GraphQL errors: ${message}`)
    }

    const subscription = json.data?.activeSubscription ?? null
    this.logger.log(
      `[partner] activeSubscription — shopGid=${shopifyShopGid}, hasSubscription=${!!subscription}, items=${subscription?.items?.length ?? 0}`,
    )
    return subscription
  }

  /**
   * Confirms the merchant has an active Shopify App Pricing subscription whose items include
   * the redirected `plan_handle`.
   */
  async verifyPlanHandle(
    shopifyShopGid: string,
    planHandle: string,
  ): Promise<{ valid: boolean; subscription: ActiveSubscription | null }> {
    const subscription = await this.getActiveSubscription(shopifyShopGid)
    if (!subscription) {
      return { valid: false, subscription: null }
    }

    const matched = subscription.items.some((item) => item.handle === planHandle)
    return { valid: matched, subscription }
  }
}

/** Response shape from Shopify offline token + refresh grants (expiring tokens). */
export interface ShopifyOfflineTokenResponse {
  access_token: string
  scope: string
  expires_in?: number
  refresh_token?: string
  refresh_token_expires_in?: number
}

export interface ShopTokenCredentials {
  accessToken: string
  scopes: string
  refreshToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
}

export const toShopTokenCredentials = (
  token: ShopifyOfflineTokenResponse,
): ShopTokenCredentials => {
  const now = Date.now()
  return {
    accessToken: token.access_token,
    scopes: token.scope,
    refreshToken: token.refresh_token ?? null,
    accessTokenExpiresAt:
      typeof token.expires_in === 'number' ? new Date(now + token.expires_in * 1000) : null,
    refreshTokenExpiresAt:
      typeof token.refresh_token_expires_in === 'number'
        ? new Date(now + token.refresh_token_expires_in * 1000)
        : null,
  }
}

import type { Request } from 'express'
import type { ShopifyProxyRequest } from '../../auth/shop.decorator'
import type { RateLimitScope } from './rate-limit.types'

const getHeaderString = (req: Request, headerName: string): string | undefined => {
  const value = req.headers[headerName]
  if (typeof value === 'string') {
    return value.trim()
  }
  if (Array.isArray(value) && value[0]) {
    return value[0].trim()
  }
  return undefined
}

/** Prefer proxy headers, then Express req.ip (needs trust proxy in main.ts). */
export const getClientIp = (req: Request): string => {
  const cfConnectingIp = getHeaderString(req, 'cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  const forwardedFor = getHeaderString(req, 'x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  const realIp = getHeaderString(req, 'x-real-ip')
  if (realIp) {
    return realIp
  }

  if (req.ip) {
    return req.ip
  }

  return req.socket?.remoteAddress ?? 'unknown'
}

export const buildRateLimitKey = (req: ShopifyProxyRequest, scope: RateLimitScope): string => {
  const ip = getClientIp(req)

  if (!ip) {
    throw new Error('IP is required')
  }

  if (scope === 'ip') {
    return `ip:${ip}`
  }

  const shop = req.shopifyShop ?? 'unknown-shop'
  const base = `shop:${shop}:ip:${ip}`

  if (scope === 'shop-ip-write') {
    return `${base}:write`
  }

  return base
}

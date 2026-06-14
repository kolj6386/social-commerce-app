import { createHmac, timingSafeEqual } from 'crypto'

type ProxyQuery = Record<string, string | string[] | undefined>

const resolveQueryValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }
  return value ?? ''
}

export function validateAppProxySignature(query: ProxyQuery, clientSecret: string): boolean {
  const signature = query.signature
  if (!signature || Array.isArray(signature)) {
    return false
  }

  const message = Object.entries(query)
    .filter(([key]) => key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${resolveQueryValue(value)}`)
    .join('')

  const calculated = createHmac('sha256', clientSecret).update(message).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

export function parseShopFromProxyQuery(query: ProxyQuery): string | null {
  const shop = resolveQueryValue(query.shop)
  if (!shop.endsWith('.myshopify.com')) {
    return null
  }
  return shop
}

export function isProxyTimestampValid(query: ProxyQuery, maxAgeSeconds = 60): boolean {
  const raw = resolveQueryValue(query.timestamp)
  const timestamp = Number.parseInt(raw, 10)
  if (!Number.isFinite(timestamp)) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return Math.abs(now - timestamp) <= maxAgeSeconds
}

import { createHmac } from 'crypto'

export function validateShopifyHmac(
  query: Record<string, string | string[] | undefined>,
  clientSecret: string,
): boolean {
  const hmac = query.hmac
  if (!hmac || Array.isArray(hmac)) {
    return false
  }

  const sortedParams = Object.entries(query)
    .filter(([key]) => key !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const resolved = Array.isArray(value) ? value[0] : value
      return `${key}=${resolved ?? ''}`
    })

  const data = sortedParams.join('&')
  const calculatedHmac = createHmac('sha256', clientSecret).update(data).digest('hex')

  return calculatedHmac === hmac
}

export function generateNonce(): string {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

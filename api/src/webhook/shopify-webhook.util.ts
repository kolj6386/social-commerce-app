import { createHmac, timingSafeEqual } from 'crypto'

export const verifyShopifyWebhookHmac = (
  rawBody: Buffer | undefined,
  hmacHeader: string | undefined,
  secret: string | undefined,
): boolean => {
  if (!secret || !rawBody || !hmacHeader) {
    return false
  }

  const digest = createHmac('sha256', secret).update(rawBody).digest('base64')
  const expected = Buffer.from(digest)
  const received = Buffer.from(hmacHeader)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export const parseWebhookJson = <T>(rawBody: Buffer | undefined): T | null => {
  if (!rawBody?.length) {
    return null
  }

  try {
    return JSON.parse(rawBody.toString('utf8')) as T
  } catch {
    return null
  }
}

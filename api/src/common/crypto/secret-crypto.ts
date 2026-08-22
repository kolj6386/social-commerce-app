import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const PREFIX = 'enc:v1:'

/**
 * AES-256-GCM helpers for shop offline tokens at rest.
 * Set TOKEN_ENCRYPTION_KEY (any long secret); key is derived via SHA-256.
 * Values without the enc:v1: prefix are treated as legacy plaintext.
 */
export const encryptSecret = (plaintext: string, encryptionKey: string | undefined): string => {
  if (!encryptionKey || !plaintext) {
    return plaintext
  }
  if (plaintext.startsWith(PREFIX)) {
    return plaintext
  }

  const key = createHash('sha256').update(encryptionKey).digest()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`
}

export const decryptSecret = (stored: string, encryptionKey: string | undefined): string => {
  if (!stored || !stored.startsWith(PREFIX)) {
    return stored
  }
  if (!encryptionKey) {
    throw new Error('TOKEN_ENCRYPTION_KEY is required to decrypt stored secrets')
  }

  const payload = stored.slice(PREFIX.length)
  const [ivB64, tagB64, dataB64] = payload.split('.')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Corrupt encrypted secret')
  }

  const key = createHash('sha256').update(encryptionKey).digest()
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
const HTML_TAG = /<[^>]*>/g

/** Strip control chars and HTML tags from user-facing plain text. */
export function sanitizePlainText(value: string): string {
  return value.replace(CONTROL_CHARS, '').replace(HTML_TAG, '').trim()
}

/** Keep only absolute https URLs (drops javascript:, data:, etc.). */
export function sanitizeHttpsUrls(urls: string[]): string[] {
  return urls
    .map((url) => url.trim())
    .filter((url) => {
      try {
        return new URL(url).protocol === 'https:'
      } catch {
        return false
      }
    })
}

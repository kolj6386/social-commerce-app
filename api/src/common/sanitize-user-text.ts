const HTML_TAG = /<[^>]*>/g

const stripControlChars = (value: string): string =>
  [...value]
    .filter((char) => {
      const code = char.charCodeAt(0)
      return !(code <= 0x1f || code === 0x7f)
    })
    .join('')

/** Strip control chars and HTML tags from user-facing plain text. */
export function sanitizePlainText(value: string): string {
  return stripControlChars(value).replace(HTML_TAG, '').trim()
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

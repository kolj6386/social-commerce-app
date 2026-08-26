export interface ShopSettings {
  allowGuestPosting: boolean
  autoApproveLoggedInPosts: boolean
  notificationsEnabled: boolean
  languageFilter: string
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  allowGuestPosting: false,
  autoApproveLoggedInPosts: false,
  notificationsEnabled: false,
  languageFilter: '',
}

/** True when content matches any comma-separated custom filter term (case-insensitive). */
export function containsBlockedLanguage(content: string, languageFilter: string): boolean {
  const terms = languageFilter
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)

  if (!terms.length) {
    return false
  }

  const haystack = content.toLowerCase()
  return terms.some((term) => haystack.includes(term))
}

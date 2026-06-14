export function parsePostMedia(value: string | null | undefined): string[] {
  if (!value) {
    return []
  }

  const trimmed = value.trim()
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map(String)
      }
    } catch {
      // fall through to comma split
    }
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

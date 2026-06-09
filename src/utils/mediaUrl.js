function apiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
  return base || ''
}

export function resolveMediaUrl(path) {
  if (!path) return null

  if (typeof path === 'object') {
    return resolveMediaUrl(
      path.url ??
      path.full_url ??
      path.image_url ??
      path.path ??
      path.file_path ??
      path.file_name ??
      path.image,
    )
  }

  let value = String(path).trim()
  if (!value) return null

  const storageMatch = value.match(/\/storage\/(.+)$/i)
  if (storageMatch) {
    value = storageMatch[1]
  } else if (value.startsWith('storage/')) {
    value = value.slice('storage/'.length)
  }

  const normalized = value.replace(/^\//, '')
  const origin = apiOrigin()

  if (origin) {
    return `${origin}/storage/${normalized}`
  }

  return `/storage/${normalized}`
}

export function extractMediaUrls(...sources) {
  const urls = []

  const add = (value) => {
    if (value == null) return
    if (Array.isArray(value)) {
      value.forEach(add)
      return
    }
    const resolved = resolveMediaUrl(value)
    if (resolved && !urls.includes(resolved)) urls.push(resolved)
  }

  sources.forEach(add)
  return urls
}

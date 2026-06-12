export function withQuery(path, params = {}) {
  const query = new URLSearchParams(params).toString()
  return query ? `${path}?${query}` : path
}

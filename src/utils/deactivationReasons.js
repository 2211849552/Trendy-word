const STORAGE_KEY = 'trendy_deactivation_reasons_v1'

function readStore() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(next) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage failures
  }
}

function buildKey(entity, id) {
  if (!entity || id == null || id === '') return ''
  return `${String(entity)}:${String(id)}`
}

export function getDeactivationReason(entity, id) {
  const key = buildKey(entity, id)
  if (!key) return ''
  return String(readStore()[key] ?? '')
}

export function setDeactivationReason(entity, id, reason) {
  const key = buildKey(entity, id)
  if (!key) return
  const trimmed = String(reason ?? '').trim()
  const store = readStore()
  if (!trimmed) {
    delete store[key]
  } else {
    store[key] = trimmed
  }
  writeStore(store)
}

export function clearDeactivationReason(entity, id) {
  const key = buildKey(entity, id)
  if (!key) return
  const store = readStore()
  if (store[key] == null) return
  delete store[key]
  writeStore(store)
}

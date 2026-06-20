import { apiRequest } from './client.js'

const DELIVERY_PRICE_MANAGER_ROLES = new Set(['super_admin', 'stores_admin'])
const STORE_MANAGEMENT_ROLES = new Set(['super_admin', 'stores_admin'])

const ROLE_LABEL_TO_SLUG = {
  'مدير نظام': 'super_admin',
  'مدير النظام': 'super_admin',
  'مسؤول متاجر': 'stores_admin',
  'مسؤول عمليات': 'operations_admin',
  محاسب: 'accountant',
}

const ROLE_SLUG_ALIASES = {
  admin: 'super_admin',
  platform_admin: 'super_admin',
  superadmin: 'super_admin',
  storesadmin: 'stores_admin',
  operationsadmin: 'operations_admin',
}

function toRoleSlug(value) {
  if (value == null || value === '') return ''
  const raw = String(value).trim()
  if (!raw) return ''
  if (ROLE_LABEL_TO_SLUG[raw]) return ROLE_LABEL_TO_SLUG[raw]

  const normalized = raw.toLowerCase().replace(/[\s-]+/g, '_')
  return ROLE_SLUG_ALIASES[normalized] ?? ROLE_LABEL_TO_SLUG[normalized] ?? normalized
}

function normalizeRoleSlug(role) {
  if (typeof role === 'string' || typeof role === 'number') {
    return toRoleSlug(role)
  }
  const slug = role?.slug ?? role?.name ?? role?.role ?? role?.label ?? ''
  return toRoleSlug(slug)
}

function collectRoleSlugs(item) {
  const slugs = new Set()

  const pushRole = (role) => {
    const slug = normalizeRoleSlug(role)
    if (slug) slugs.add(slug)
  }

  const roles = item?.roles
  if (Array.isArray(roles)) {
    roles.forEach(pushRole)
  } else if (roles != null && roles !== '') {
    pushRole(roles)
  }

  if (Array.isArray(item?.role_names)) {
    item.role_names.forEach(pushRole)
  }

  if (item?.role_slug != null && item?.role_slug !== '') {
    pushRole(item.role_slug)
  }

  if (item?.role != null && item?.role !== '') {
    pushRole(item.role)
  }

  return [...slugs]
}

const ADMIN_USER_ROLES_KEY = 'admin_user_roles'

export function persistUserRoles(userId, roleSlugs) {
  if (!userId || !Array.isArray(roleSlugs) || roleSlugs.length === 0) return
  try {
    localStorage.setItem(ADMIN_USER_ROLES_KEY, JSON.stringify({ userId, roleSlugs }))
  } catch {
    // ignore storage errors
  }
}

export function loadPersistedUserRoles(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(ADMIN_USER_ROLES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (parsed?.userId === userId && Array.isArray(parsed.roleSlugs)) {
      return parsed.roleSlugs
    }
  } catch {
    // ignore parse errors
  }
  return []
}

export function clearPersistedUserRoles() {
  localStorage.removeItem(ADMIN_USER_ROLES_KEY)
}

function finalizeUser(user) {
  if (user?.id && user.roleSlugs?.length) {
    persistUserRoles(user.id, user.roleSlugs)
  }
  return user
}

export function mergeCurrentUser(previous, incoming) {
  if (!incoming) return previous ?? null
  if (!previous) return finalizeUser(incoming)

  const roleSlugs = [...new Set([
    ...(incoming.roleSlugs ?? []),
    ...(previous.roleSlugs ?? []),
  ])]

  return finalizeUser({
    ...incoming,
    roleSlugs,
  })
}

// GET /api/user  ← يتطلب auth:sanctum
export function getCurrentUser() {
  return apiRequest('/api/user')
}

export function mapCurrentUser(data) {
  const item = data?.data ?? data?.user ?? data
  const id = item?.id ?? null
  let roleSlugs = collectRoleSlugs(item)

  if (roleSlugs.length === 0 && id) {
    roleSlugs = loadPersistedUserRoles(id)
  }

  return finalizeUser({
    id,
    name: item?.name ?? '',
    email: item?.email ?? '',
    roleSlugs,
  })
}

/** super_admin و stores_admin فقط — store_manager ممنوع */
export function canManageStoreDeliveryPrices(user) {
  if (!user) return false
  const slugs = user?.roleSlugs ?? []
  if (slugs.some((slug) => slug === 'store_manager' || slug === 'store_staff')) {
    return false
  }
  return slugs.some((slug) => DELIVERY_PRICE_MANAGER_ROLES.has(slug))
}

/** مدير نظام (super_admin) ومسؤول متاجر (stores_admin) فقط — يُستبعد مسؤول العمليات والمحاسب */
export function hasStoreManagementAccess(user) {
  if (!user) return false
  const slugs = user.roleSlugs ?? []
  if (slugs.length === 0) return false
  return slugs.some((slug) => STORE_MANAGEMENT_ROLES.has(slug))
}

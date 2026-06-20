import { apiRequest } from './client.js'

const DELIVERY_PRICE_MANAGER_ROLES = new Set(['super_admin', 'stores_admin'])

// مسار الاختبار الافتراضي — يُعيد بيانات المستخدم المسجَّل حالياً
// يُستخدم للتحقق من صحة التوكن أثناء التطوير
// GET /api/user  ← يتطلب auth:sanctum
export function getCurrentUser() {
  return apiRequest('/api/user')
}

function normalizeRoleSlug(role) {
  if (typeof role === 'string') return role
  return role?.slug ?? role?.name ?? role?.role ?? ''
}

export function mapCurrentUser(data) {
  const item = data?.data ?? data?.user ?? data
  const roles = item?.roles ?? item?.role ?? []
  const roleList = Array.isArray(roles) ? roles : [roles].filter(Boolean)
  const roleSlugs = roleList.map(normalizeRoleSlug).filter(Boolean)

  if (roleSlugs.length === 0 && item?.role_slug) {
    roleSlugs.push(String(item.role_slug))
  }
  if (roleSlugs.length === 0 && typeof item?.role === 'string') {
    roleSlugs.push(item.role)
  }

  return {
    id: item?.id ?? null,
    name: item?.name ?? '',
    email: item?.email ?? '',
    roleSlugs,
  }
}

/** super_admin و stores_admin فقط — store_manager ممنوع */
export function canManageStoreDeliveryPrices(user) {
  const slugs = user?.roleSlugs ?? []
  if (slugs.some((slug) => slug === 'store_manager' || slug === 'store_staff')) {
    return false
  }
  if (slugs.some((slug) => DELIVERY_PRICE_MANAGER_ROLES.has(slug))) {
    return true
  }
  // لوحة الإدارة العليا: إن لم تُرجَع الأدوار من /api/user نفترض صلاحية التعديل
  return slugs.length === 0
}

/** مدير نظام (super_admin) ومسؤول متاجر (stores_admin) فقط */
export function hasStoreManagementAccess(user) {
  const slugs = user?.roleSlugs ?? []
  if (slugs.length === 0) return true
  return slugs.some((slug) => slug === 'super_admin' || slug === 'stores_admin')
}


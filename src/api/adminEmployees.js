import { apiRequest } from './client.js'

// [11] إدارة الموظفين
// GET /api/employees — عرض القائمة والبحث والفلترة
export function getEmployees(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/employees${query ? `?${query}` : ''}`)
}

// GET /api/employees/{id}
export function getEmployee(id) {
  return apiRequest(`/api/employees/${encodeURIComponent(String(id))}`)
}

// POST /api/employees — إضافة موظف
export function createEmployee(body) {
  return apiRequest('/api/employees', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// PATCH /api/employees/{id} — تعديل بيانات الموظف
export function updateEmployee(id, body) {
  return apiRequest(`/api/employees/${encodeURIComponent(String(id))}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

// POST /api/employees/{id}/toggle — تفعيل / تعطيل
export function toggleEmployeeStatus(id) {
  return apiRequest(`/api/employees/${encodeURIComponent(String(id))}/toggle`, {
    method: 'POST',
  })
}

export const PLATFORM_ROLES = [
  { id: 1, slug: 'super_admin', label: 'مدير نظام' },
  { id: 2, slug: 'stores_admin', label: 'مسؤول متاجر' },
  { id: 3, slug: 'operations_admin', label: 'مسؤول عمليات' },
  { id: 4, slug: 'accountant', label: 'محاسب' },
]

/** أدوار يمكن تعيينها عند إضافة/تعديل موظف — لا يشمل مدير النظام */
export const ASSIGNABLE_PLATFORM_ROLES = PLATFORM_ROLES.filter(
  (role) => role.slug !== 'super_admin',
)

const STATUS_UI = {
  active: 'نشط',
  inactive: 'معطل',
}

const ROLE_FILTER_API = {
  'جميع الأدوار': null,
  'مدير نظام': 'super_admin',
  'مسؤول متاجر': 'stores_admin',
  'مسؤول عمليات': 'operations_admin',
  محاسب: 'accountant',
}

export function extractEmployeeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function extractCreatedEmployee(data) {
  const item = data?.data ?? data
  return item?.id != null ? item : null
}

/** تجنّب إرسال هاتف فارغ — يسبب تعارض unique في قاعدة البيانات */
export function buildCreateEmployeeBody({ name, email, phone, password, roleId }) {
  const body = {
    name: name.trim(),
    email: email.trim(),
    password: password.trim(),
    role_id: roleId,
  }
  const trimmedPhone = phone?.trim()
  if (trimmedPhone) body.phone = trimmedPhone
  return body
}

export function buildUpdateEmployeeBody({ name, email, phone, password, roleId }) {
  const body = {
    name: name.trim(),
    email: email.trim(),
    role_id: roleId,
  }
  const trimmedPhone = phone?.trim()
  if (trimmedPhone) body.phone = trimmedPhone
  if (password?.trim()) body.password = password.trim()
  return body
}

export function upsertEmployeeInList(list, employee) {
  const idx = list.findIndex((item) => item.id === employee.id)
  if (idx === -1) return [employee, ...list]
  const next = [...list]
  next[idx] = employee
  return next
}

export function extractPaginationMeta(data) {
  return data?.meta ?? {}
}

export function uiRoleFilterToApi(roleLabel) {
  return ROLE_FILTER_API[roleLabel] ?? null
}

export function mapEmployeeStatus(status) {
  return STATUS_UI[status] ?? status ?? '—'
}

function formatDate(value) {
  if (!value) return '—'
  return String(value).slice(0, 10)
}

function formatLastLogin(value) {
  if (!value) return 'لم يسجل الدخول'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('ar-LY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function mapRoleLabel(roles) {
  const slug = Array.isArray(roles) ? roles[0] : roles
  const found = PLATFORM_ROLES.find((role) => role.slug === slug)
  return found?.label ?? slug ?? '—'
}

export function roleSlugToId(slug) {
  return PLATFORM_ROLES.find((role) => role.slug === slug)?.id ?? null
}

export function roleLabelToId(label) {
  return PLATFORM_ROLES.find((role) => role.label === label)?.id ?? null
}

export function mapEmployee(item) {
  const roleSlug = Array.isArray(item.roles) ? item.roles[0] : ''
  return {
    id: item.id,
    name: item.name ?? '—',
    email: item.email ?? '—',
    phone: item.phone ?? '—',
    role: mapRoleLabel(item.roles),
    roleSlug,
    roleId: roleSlugToId(roleSlug),
    hireDate: formatDate(item.staff_profile?.hire_date ?? item.joined_at),
    lastLogin: formatLastLogin(item.last_login_at),
    status: mapEmployeeStatus(item.status),
    rawStatus: item.status ?? '',
    department: item.staff_profile?.department ?? '—',
    jobTitle: item.staff_profile?.job_title ?? '—',
    employeeIdNumber: item.staff_profile?.employee_id_number ?? '—',
    raw: item,
  }
}

export function mapEmployeeDetail(data) {
  const item = data?.data ?? data
  return mapEmployee(item)
}

export function buildEmployeeQueryParams({ search, role, status, perPage = 100 } = {}) {
  const params = { per_page: perPage }
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed
  const apiRole = uiRoleFilterToApi(role)
  if (apiRole) params.role = apiRole
  if (status === 'نشط') params.status = 'active'
  if (status === 'معطل') params.status = 'inactive'
  return params
}

export function buildEmployeeStats(employees, meta = {}) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    total: Number(meta.total ?? employees.length),
    active: employees.filter((e) => e.rawStatus === 'active').length,
    disabled: employees.filter((e) => e.rawStatus === 'inactive').length,
    newThisMonth: employees.filter((e) => {
      const joined = new Date(e.hireDate)
      return !Number.isNaN(joined.getTime()) && joined >= monthStart
    }).length,
  }
}

export function emptyEmployeeForm() {
  const defaultRole = ASSIGNABLE_PLATFORM_ROLES[2]
  return {
    name: '',
    email: '',
    phone: '',
    role: defaultRole.label,
    roleId: defaultRole.id,
    password: '',
    confirmPassword: '',
  }
}

export function employeeToForm(employee) {
  const defaultRole = ASSIGNABLE_PLATFORM_ROLES[0]
  return {
    name: employee.name ?? '',
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    role: employee.roleSlug === 'super_admin' ? defaultRole.label : (employee.role ?? defaultRole.label),
    roleId: employee.roleSlug === 'super_admin'
      ? defaultRole.id
      : (employee.roleId ?? roleLabelToId(employee.role) ?? defaultRole.id),
    password: '',
    confirmPassword: '',
  }
}

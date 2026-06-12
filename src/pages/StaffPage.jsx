import { useState, useEffect, useCallback, useRef } from 'react'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import {
  Users,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Search,
  Eye,
  Edit,
  Ban,
  Plus,
  X,
  Loader2,
} from 'lucide-react'
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  extractEmployeeList,
  extractPaginationMeta,
  mapEmployee,
  mapEmployeeDetail,
  buildEmployeeQueryParams,
  buildEmployeeStats,
  buildCreateEmployeeBody,
  buildUpdateEmployeeBody,
  extractCreatedEmployee,
  upsertEmployeeInList,
  emptyEmployeeForm,
  employeeToForm,
  PLATFORM_ROLES,
  ASSIGNABLE_PLATFORM_ROLES,
  roleLabelToId,
} from '../api/adminEmployees.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية إدارة الموظفين.'
  if (err?.status === 422 || err?.status === 500) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

function getRoleBadgeColor(role) {
  switch (role) {
    case 'مدير نظام': return 'bg-brand-300 text-brand-700'
    case 'مسؤول عمليات': return 'bg-brand-300 text-white/90'
    case 'محاسب': return 'bg-brand-300 text-white/90'
    case 'مسؤول متاجر': return 'bg-brand-300 text-white/90'
    default: return 'bg-brand-300 text-white/80'
  }
}

export function StaffPage() {
  const [staff, setStaff] = useState([])
  const [paginationMeta, setPaginationMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeRole, setActiveRole] = useState('جميع الأدوار')

  const [selectedStaff, setSelectedStaff] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(emptyEmployeeForm())
  const [editingId, setEditingId] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [toggleLoading, setToggleLoading] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const loadSeq = useRef(0)
  const loadDebounceRef = useRef(null)

  const loadStaff = useCallback(async ({ showLoading = false } = {}) => {
    const seq = ++loadSeq.current
    const params = buildEmployeeQueryParams({
      search: searchQuery,
      role: activeRole,
    })
    if (showLoading) {
      setLoading(true)
      setLoadError('')
    }
    try {
      const data = await getEmployees(params)
      if (seq !== loadSeq.current) return
      setStaff(extractEmployeeList(data).map(mapEmployee))
      setPaginationMeta(extractPaginationMeta(data))
      setLoadError('')
    } catch (err) {
      if (seq !== loadSeq.current) return
      setStaff([])
      setPaginationMeta({})
      setLoadError(apiErrorMessage(err, 'تعذّر تحميل قائمة الموظفين.'))
    } finally {
      if (seq === loadSeq.current && showLoading) setLoading(false)
    }
  }, [searchQuery, activeRole])

  useEffect(() => {
    if (loadDebounceRef.current) clearTimeout(loadDebounceRef.current)
    loadDebounceRef.current = setTimeout(() => {
      loadStaff({ showLoading: true })
    }, 300)
    return () => {
      if (loadDebounceRef.current) clearTimeout(loadDebounceRef.current)
    }
  }, [loadStaff])

  const stats = buildEmployeeStats(staff, paginationMeta)

  const closeDetails = () => {
    setDetailsModalOpen(false)
    setSelectedStaff(null)
    setToggleError('')
  }

  const openDetails = async (employee) => {
    setSelectedStaff(employee)
    setDetailsModalOpen(true)
    setDetailLoading(true)
    setToggleError('')
    try {
      const data = await getEmployee(employee.id)
      setSelectedStaff(mapEmployeeDetail(data))
    } catch (err) {
      setActionMessage(apiErrorMessage(err, 'تعذّر تحميل تفاصيل الموظف.'))
      setTimeout(() => setActionMessage(''), 3000)
    } finally {
      setDetailLoading(false)
    }
  }

  const openEdit = (employee = null) => {
    if (employee) {
      setEditingId(employee.id)
      setEditForm(employeeToForm(employee))
    } else {
      setEditingId(null)
      setEditForm(emptyEmployeeForm())
    }
    setSaveError('')
    setEditModalOpen(true)
  }

  const closeEdit = () => {
    setEditModalOpen(false)
    setEditingId(null)
    setEditForm(emptyEmployeeForm())
    setSaveError('')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setSaveError('')

    const roleId = roleLabelToId(editForm.role)
    if (!roleId) {
      setSaveError('الدور الوظيفي غير صالح.')
      return
    }

    if (!editingId && !editForm.password.trim()) {
      setSaveError('كلمة المرور مطلوبة للموظف الجديد.')
      return
    }

    if (editForm.password && editForm.password.length < 8) {
      setSaveError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
      return
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setSaveError('تأكيد كلمة المرور غير متطابق.')
      return
    }

    setSaveLoading(true)
    try {
      if (loadDebounceRef.current) {
        clearTimeout(loadDebounceRef.current)
        loadDebounceRef.current = null
      }

      if (editingId) {
        const body = buildUpdateEmployeeBody({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          password: editForm.password,
          roleId,
        })
        const updated = await updateEmployee(editingId, body)
        const saved = extractCreatedEmployee(updated)
        if (saved) {
          const mapped = mapEmployee(saved)
          setStaff((prev) => upsertEmployeeInList(prev, mapped))
        }
        setActionMessage('تم تحديث بيانات الموظف.')
      } else {
        const created = await createEmployee(
          buildCreateEmployeeBody({
            name: editForm.name,
            email: editForm.email,
            phone: editForm.phone,
            password: editForm.password,
            roleId,
          }),
        )
        const saved = extractCreatedEmployee(created)
        if (saved) {
          const mapped = mapEmployee(saved)
          setStaff((prev) => upsertEmployeeInList(prev, mapped))
        }
        setActionMessage('تمت إضافة الموظف بنجاح.')
      }

      closeEdit()
      await loadStaff()
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'تعذّر حفظ بيانات الموظف.'))
    } finally {
      setSaveLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedStaff) return

    setToggleLoading(true)
    setToggleError('')
    const wasActive = selectedStaff.rawStatus === 'active'
    try {
      await toggleEmployeeStatus(selectedStaff.id)
      const data = await getEmployee(selectedStaff.id)
      setSelectedStaff(mapEmployeeDetail(data))
      await loadStaff()
      setActionMessage(
        wasActive ? 'تم تعطيل حساب الموظف.' : 'تم إعادة تفعيل حساب الموظف.',
      )
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setToggleError(apiErrorMessage(err, 'تعذّر تحديث حالة الموظف.'))
    } finally {
      setToggleLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">إدارة الموظفين</h1>
          <p className="text-sm text-white/60">إدارة حسابات الموظفين والصلاحيات</p>
        </div>
        <PrimaryButton onClick={() => openEdit(null)} className="shrink-0">
          <Plus className="size-5" strokeWidth={2.5} aria-hidden />
          إضافة موظف
        </PrimaryButton>
      </div>

      {actionMessage ? (
        <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {actionMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <Users className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي الموظفين</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.total}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <UserCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">الموظفون النشطون</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.active}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">حسابات معطلة</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.disabled}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <TrendingUp className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">موظفون جدد (الشهر)</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.newThisMonth}</p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <select
          value={activeRole}
          onChange={(e) => setActiveRole(e.target.value)}
          className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option>جميع الأدوار</option>
          {PLATFORM_ROLES.map((role) => (
            <option key={role.slug}>{role.label}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث بالاسم أو البريد أو الدور..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-brand-300 py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-brand-200 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm ">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 font-medium">الاسم</th>
                <th className="px-3 py-3 font-medium">البريد الإلكتروني</th>
                <th className="px-3 py-3 font-medium">الهاتف</th>
                <th className="px-3 py-3 font-medium">الدور</th>
                <th className="px-3 py-3 font-medium">تاريخ التوظيف</th>
                <th className="px-3 py-3 font-medium">آخر دخول</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
                <th className="px-3 py-3 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-3 py-12 text-center text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      جاري تحميل الموظفين...
                    </span>
                  </td>
                </tr>
              ) : staff.map((s) => (
                <tr key={s.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-bold text-white">{s.name}</td>
                  <td className="px-3 py-3 text-white/70 font-mono text-xs">{s.email}</td>
                  <td className="px-3 py-3 text-white/70 font-mono text-xs">{s.phone}</td>
                  <td className="px-3 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(s.role)}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-white/60">{s.hireDate}</td>
                  <td className="px-3 py-3 text-white/60 text-xs">{s.lastLogin}</td>
                  <td className="px-3 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      s.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openDetails(s)}
                      className="icon-btn-view"
                      title="عرض التفاصيل"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && staff.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-white/60">
                    {loadError || 'لا يوجد موظفين مطابقين للبحث أو الفلتر.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-brand-300/50 text-left">
          <p className="text-sm text-white/60">
            عرض {staff.length} من {stats.total} موظف
          </p>
        </div>
      </div>

      {detailsModalOpen && selectedStaff ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل الموظف</h2>
              <button type="button" onClick={closeDetails} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-white/60">
                  <Loader2 className="size-6 animate-spin" />
                  <span>جاري تحميل التفاصيل...</span>
                </div>
              ) : (
              <>
              <div className="flex justify-between items-center text-right border-b border-white/5 pb-4 mb-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedStaff.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedStaff.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedStaff.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{selectedStaff.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">البريد الإلكتروني</p>
                  <p className="font-bold text-white text-lg font-mono">{selectedStaff.email}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">رقم الهاتف</p>
                  <p className="font-bold text-white text-lg font-mono">{selectedStaff.phone}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">تاريخ التوظيف</p>
                  <p className="font-bold text-white text-lg">{selectedStaff.hireDate}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">آخر دخول</p>
                  <p className="font-bold text-white text-sm">{selectedStaff.lastLogin}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">القسم</p>
                  <p className="font-bold text-white text-lg">{selectedStaff.department}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">المسمى الوظيفي</p>
                  <p className="font-bold text-white text-lg">{selectedStaff.jobTitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    closeDetails()
                    openEdit(selectedStaff)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-brand-300 px-4 py-2.5 text-sm font-bold text-white/80 hover:bg-brand-100"
                >
                  <Edit className="size-4" />
                  تعديل البيانات
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white/80">إدارة الحساب</h3>
                <p className="text-sm text-white/70">
                  {selectedStaff.rawStatus === 'active'
                    ? 'يمكنك تعطيل حساب هذا الموظف. سيتم إنهاء جلساته النشطة.'
                    : 'هذا الحساب معطّل حالياً. يمكنك إعادة تفعيله.'}
                </p>
                {toggleError ? (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {toggleError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={toggleLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:opacity-60 ${
                    selectedStaff.rawStatus === 'active'
                      ? 'border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {toggleLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : selectedStaff.rawStatus === 'active' ? (
                    <Ban className="size-4" />
                  ) : (
                    <UserCheck className="size-4" />
                  )}
                  {selectedStaff.rawStatus === 'active' ? 'تعطيل الحساب' : 'إعادة تفعيل الحساب'}
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {editModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
              </h2>
              <button type="button" onClick={closeEdit} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 text-right" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-brand"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="input-brand text-left font-mono"
                    dir="ltr"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="input-brand text-left font-mono"
                    dir="ltr"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">الدور الوظيفي</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input-brand"
                  required={!editingId}
                >
                  {!editingId ? <option value="">اختر الدور الوظيفي</option> : null}
                  {ASSIGNABLE_PLATFORM_ROLES.map((role) => (
                    <option key={role.slug}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    {editingId ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="input-brand text-left"
                    dir="ltr"
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    required={!editingId}
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    className="input-brand text-left"
                    dir="ltr"
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {saveError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {saveError}
                </p>
              ) : null}

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <PrimaryButton type="submit" disabled={saveLoading}>
                  {saveLoading ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة الموظف'}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-lg border border-white/10 bg-brand-200 px-6 py-2.5 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

    </div>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Users,
  UserCheck,
  UserX,
  ShoppingCart,
  Search,
  Eye,
  X,
  Ban,
  Download,
  Loader2,
} from 'lucide-react'
import {
  fetchCustomersList,
  fetchCustomerDetail,
  exportCustomers,
  deactivateCustomer,
  reactivateCustomer,
  extractExportCustomerList,
  mapCustomer,
  resolveCustomerId,
  buildCustomerQueryParams,
  buildCustomerStats,
  customersToCsv,
} from '../api/adminCustomers.js'
import { openCustomersPrintWindow } from '../utils/printCustomers.js'
import {
  getDeactivationReason,
  setDeactivationReason,
  clearDeactivationReason,
} from '../utils/deactivationReasons.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية إدارة الزبائن.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [paginationMeta, setPaginationMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const [deactivateReason, setDeactivateReason] = useState('')
  const [showDeactivateForm, setShowDeactivateForm] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [toggleError, setToggleError] = useState('')

  const [exporting, setExporting] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const loadSeq = useRef(0)
  const selectedCustomerIdRef = useRef(null)

  const loadCustomers = useCallback(async () => {
    const seq = ++loadSeq.current
    const params = buildCustomerQueryParams({
      search: searchQuery,
      status: activeStatus,
    })
    const { customers, meta } = await fetchCustomersList(params)
    if (seq !== loadSeq.current) return
    setCustomers(customers)
    setPaginationMeta(meta)
  }, [searchQuery, activeStatus])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadCustomers()
      } catch (err) {
        setCustomers([])
        setPaginationMeta({})
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل قائمة الزبائن.'))
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [loadCustomers])

  const stats = buildCustomerStats(customers, paginationMeta)

  const closeDetails = () => {
    setDetailsModalOpen(false)
    setSelectedCustomer(null)
    selectedCustomerIdRef.current = null
    setDeactivateReason('')
    setShowDeactivateForm(false)
    setToggleError('')
  }

  const openDetails = async (customer) => {
    selectedCustomerIdRef.current = customer.id
    setSelectedCustomer(customer)
    setDetailsModalOpen(true)
    setDetailLoading(true)
    setDeactivateReason('')
    setShowDeactivateForm(false)
    setToggleError('')
    try {
      const detail = await fetchCustomerDetail(customer.id)
      const cachedReason = getDeactivationReason('customer', customer.id)
      setSelectedCustomer(detail)
      if (cachedReason && !detail.deactivationReason) {
        setSelectedCustomer({ ...detail, deactivationReason: cachedReason })
      }
    } catch (err) {
      setActionMessage(apiErrorMessage(err, 'تعذّر تحميل تفاصيل الزبون.'))
      setTimeout(() => setActionMessage(''), 3000)
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshSelectedCustomer = async (customerId) => {
    const detail = await fetchCustomerDetail(customerId)
    const cachedReason = getDeactivationReason('customer', customerId)
    setSelectedCustomer(
      cachedReason && !detail.deactivationReason
        ? { ...detail, deactivationReason: cachedReason }
        : detail,
    )
  }

  const getSelectedCustomerRecordId = () =>
    resolveCustomerId(selectedCustomer, selectedCustomerIdRef.current)

  const handleDeactivate = async (e) => {
    e.preventDefault()
    if (!selectedCustomer) return

    if (!deactivateReason.trim()) {
      setToggleError('سبب التعطيل مطلوب.')
      return
    }

    const customerId = getSelectedCustomerRecordId()
    if (!customerId) {
      setToggleError('معرّف الزبون غير صالح.')
      return
    }

    setToggleLoading(true)
    setToggleError('')
    try {
      await deactivateCustomer(customerId, selectedCustomer, deactivateReason.trim())
      setDeactivationReason('customer', customerId, deactivateReason.trim())
      setActionMessage('تم تعطيل حساب الزبون.')
      await refreshSelectedCustomer(customerId)
      setDeactivateReason('')
      setShowDeactivateForm(false)
      await loadCustomers()
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setToggleError(apiErrorMessage(err, 'تعذّر تعطيل حساب الزبون.'))
    } finally {
      setToggleLoading(false)
    }
  }

  const handleReactivate = async (e) => {
    e.preventDefault()
    if (!selectedCustomer) return

    const customerId = getSelectedCustomerRecordId()
    if (!customerId) {
      setToggleError('معرّف الزبون غير صالح.')
      return
    }

    setToggleLoading(true)
    setToggleError('')
    try {
      await reactivateCustomer(customerId, selectedCustomer)
      clearDeactivationReason('customer', customerId)
      setActionMessage('تم إعادة تفعيل حساب الزبون.')
      await refreshSelectedCustomer(customerId)
      await loadCustomers()
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setToggleError(apiErrorMessage(err, 'تعذّر إعادة تفعيل حساب الزبون.'))
    } finally {
      setToggleLoading(false)
    }
  }

  const handlePrint = async () => {
    setExporting(true)
    setActionMessage('')
    const params = buildCustomerQueryParams({
      search: searchQuery,
      status: activeStatus,
      perPage: 500,
    })

    try {
      let list = []
      try {
        const exportData = await exportCustomers(params)
        const exported = extractExportCustomerList(exportData).map(mapCustomer)
        if (exported.length) list = exported
      } catch {
        // fallback below
      }
      if (!list.length) {
        const { customers: fetched } = await fetchCustomersList(params)
        list = fetched
      }
      const opened = openCustomersPrintWindow(list)

      if (!opened) {
        const blob = new Blob([customersToCsv(list)], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'customers_list.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setActionMessage('تعذّر فتح نافذة الطباعة. تم تحميل الملف بدلاً من ذلك.')
      } else {
        setActionMessage('تم فتح قائمة الزبائن للطباعة.')
      }
    } catch (err) {
      setActionMessage(apiErrorMessage(err, 'تعذّر طباعة قائمة الزبائن.'))
    } finally {
      setExporting(false)
      setTimeout(() => setActionMessage(''), 5000)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">إدارة الزبائن</h1>
          <p className="text-sm text-white/60">إدارة حسابات الزبائن وبياناتهم</p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          disabled={exporting}
          className="btn-primary shrink-0 disabled:opacity-60"
        >
          {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          طباعة قائمة الزبائن
        </button>
      </div>

      {actionMessage ? (
        <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {actionMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <Users className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي الزبائن</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.total}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <UserCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">الزبائن النشطون</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.active}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <UserX className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">حسابات معطلة</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.disabled}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <ShoppingCart className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي الطلبات</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.orders}</p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <select
          value={activeStatus}
          onChange={(e) => setActiveStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option>جميع الحالات</option>
          <option>نشط</option>
          <option>معطل</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث بالاسم أو البريد أو الهاتف..."
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
                <th className="px-3 py-3 font-medium">الموقع</th>
                <th className="px-3 py-3 font-medium">تاريخ الانضمام</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
                <th className="px-3 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-3 py-12 text-center text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      جاري تحميل الزبائن...
                    </span>
                  </td>
                </tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-bold text-white">{c.name}</td>
                  <td className="px-3 py-3 text-white/70 font-mono text-xs">{c.email}</td>
                  <td className="px-3 py-3 text-white/70 font-mono text-xs">{c.phone}</td>
                  <td className="px-3 py-3 text-white/70">{c.location}</td>
                  <td className="px-3 py-3 text-white/60">{c.joinDate}</td>
                  <td className="px-3 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => openDetails(c)}
                      className="icon-btn-view"
                      title="عرض التفاصيل"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-white/60">
                    {loadError || 'لا يوجد زبائن مطابقين للبحث أو الفلتر.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-brand-300/50 text-left">
          <p className="text-sm text-white/60">
            عرض {customers.length} من {stats.total} زبون
          </p>
        </div>
      </div>

      {detailsModalOpen && selectedCustomer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto py-10">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

            <div className="flex items-center justify-between border-b border-white/5 p-6 shrink-0">
              <h2 className="text-2xl font-bold text-white">تفاصيل الزبون</h2>
              <button type="button" onClick={closeDetails} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-white/60">
                  <Loader2 className="size-6 animate-spin" />
                  <span>جاري تحميل التفاصيل...</span>
                </div>
              ) : (
              <>
              <div className="flex justify-between items-center text-right border-b border-white/5 pb-4 mb-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedCustomer.rawStatus === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedCustomer.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-sm text-white/60 mt-1 font-mono">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">الموقع</p>
                  <p className="font-bold text-white text-lg">{selectedCustomer.location}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">رقم الهاتف</p>
                  <p className="font-bold text-white text-lg font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-5 text-center flex flex-col items-center justify-center">
                    <p className="font-bold text-purple-600 text-xl mb-1">{selectedCustomer.joinDate}</p>
                    <p className="text-sm text-white/70">تاريخ الانضمام</p>
                 </div>
                 <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-5 text-center flex flex-col items-center justify-center">
                    <p className="font-bold text-emerald-600 text-3xl mb-1" dir="ltr">
                      {Number(selectedCustomer.totalSpent).toLocaleString('ar-LY')}
                    </p>
                    <p className="text-sm text-white/70 mt-1">د.ل إنفاق كلي</p>
                 </div>
                 <div className="rounded-xl bg-brand-100/50 border border-brand-100 p-5 text-center flex flex-col items-center justify-center">
                    <p className="font-bold text-white text-3xl mb-1">{selectedCustomer.orders}</p>
                    <p className="text-sm text-white/70 mt-1">طلب</p>
                 </div>
              </div>

              {selectedCustomer.totalComplaints != null ? (
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">عدد الشكاوى</p>
                  <p className="font-bold text-white text-lg">{selectedCustomer.totalComplaints}</p>
                </div>
              ) : null}

              {selectedCustomer.rawStatus !== 'active' && selectedCustomer.deactivationReason ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-right">
                  <p className="text-sm text-amber-200/80 mb-1">سبب التعطيل</p>
                  <p className="font-bold text-amber-100">{selectedCustomer.deactivationReason}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white/80">إدارة الحساب</h3>

                {selectedCustomer.rawStatus === 'active' && !showDeactivateForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeactivateForm(true)
                      setToggleError('')
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
                  >
                    <Ban className="size-4" />
                    تعطيل الحساب
                  </button>
                ) : null}

                {selectedCustomer.rawStatus === 'active' && showDeactivateForm ? (
                  <form className="space-y-4" onSubmit={handleDeactivate}>
                    <p className="text-sm text-white/70">
                      سيتم التعطيل باستخدام بيانات الزبون المعروضة أعلاه. أدخلي سبب التعطيل فقط.
                    </p>
                    <div>
                      <label htmlFor="deactivate-reason" className="mb-2 block text-sm font-medium text-white/80">
                        سبب التعطيل <span className="text-brand-300">*</span>
                      </label>
                      <textarea
                        id="deactivate-reason"
                        value={deactivateReason}
                        onChange={(e) => setDeactivateReason(e.target.value)}
                        placeholder="اكتبي سبب تعطيل الحساب..."
                        rows={3}
                        className="input-brand resize-none"
                      />
                    </div>
                    {toggleError ? (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {toggleError}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" disabled={toggleLoading} className="btn-primary disabled:opacity-60">
                        {toggleLoading ? 'جاري الحفظ...' : 'تأكيد التعطيل'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeactivateForm(false)
                          setDeactivateReason('')
                          setToggleError('')
                        }}
                        className="rounded-xl border border-white/10 bg-brand-300 px-5 py-2.5 text-sm font-bold text-white/80 transition-colors hover:bg-brand-100"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : null}

                {selectedCustomer.rawStatus !== 'active' ? (
                  <form className="space-y-4" onSubmit={handleReactivate}>
                    <p className="text-sm text-white/70">
                      هذا الحساب معطّل حالياً ({selectedCustomer.status}). سيتم إعادة التفعيل باستخدام بيانات الزبون المعروضة أعلاه.
                    </p>
                    {toggleError ? (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {toggleError}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={toggleLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {toggleLoading ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                      إعادة تفعيل الحساب
                    </button>
                  </form>
                ) : null}
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

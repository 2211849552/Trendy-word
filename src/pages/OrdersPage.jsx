import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Package,
  CreditCard,
  Store,
  User,
  Banknote,
  Loader2,
  Phone,
} from 'lucide-react'
import {
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  reassignOrder,
  extractOrderList,
  extractOrderMeta,
  mapOrder,
  mapOrderDetail,
  buildOrderQueryParams,
  filterOrdersClient,
  buildOrderStats,
  ORDER_STATUS_OPTIONS,
} from '../api/adminOrders.js'
import { loadDriversForReassign } from '../api/adminDrivers.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض الطلبات.'
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

function getStatusStyle(status) {
  switch (status) {
    case 'قيد التنفيذ': return 'bg-brand-300 text-brand-700'
    case 'قيد الشحن': return 'bg-yellow-100 text-yellow-700'
    case 'تم التسليم': return 'bg-emerald-100 text-emerald-700'
    case 'ملغي': return 'bg-red-100 text-red-700'
    default: return 'bg-brand-300 text-white/80'
  }
}

export function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [paginationMeta, setPaginationMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [statusForm, setStatusForm] = useState({ status: '', comment: '' })
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [reassignDriverId, setReassignDriverId] = useState('')
  const [drivers, setDrivers] = useState([])
  const [driversLoading, setDriversLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const loadSeq = useRef(0)

  const loadOrders = useCallback(async () => {
    const seq = ++loadSeq.current
    const params = buildOrderQueryParams({ search: searchQuery })
    const data = await getOrders(params)
    if (seq !== loadSeq.current) return
    setOrders(extractOrderList(data).map(mapOrder))
    setPaginationMeta(extractOrderMeta(data))
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadOrders()
      } catch (err) {
        setOrders([])
        setPaginationMeta({})
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل قائمة الطلبات.'))
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [loadOrders])

  const filteredOrders = useMemo(
    () => filterOrdersClient(orders, { status: activeStatus }),
    [orders, activeStatus],
  )

  const stats = buildOrderStats(orders, paginationMeta)

  const fetchDriversForReassign = useCallback(async () => {
    setDriversLoading(true)
    try {
      setDrivers(await loadDriversForReassign())
    } catch {
      setDrivers([])
    } finally {
      setDriversLoading(false)
    }
  }, [])

  const closeDetails = () => {
    setDetailsModalOpen(false)
    setSelectedOrder(null)
    setActionMessage('')
    setActionError('')
    setStatusForm({ status: '', comment: '' })
    setCancelReason('')
    setShowCancelForm(false)
    setReassignDriverId('')
  }

  const refreshSelectedOrder = async (orderId) => {
    const data = await getOrder(orderId)
    const mapped = mapOrderDetail(data)
    setSelectedOrder(mapped)
    setStatusForm({ status: mapped.rawStatus, comment: '' })
    await loadOrders()
    return mapped
  }

  const openDetails = async (order) => {
    setSelectedOrder(order)
    setDetailsModalOpen(true)
    setDetailLoading(true)
    setActionMessage('')
    setActionError('')
    setShowCancelForm(false)
    setCancelReason('')
    setReassignDriverId('')
    try {
      const data = await getOrder(order.orderId)
      const mapped = mapOrderDetail(data)
      setSelectedOrder(mapped)
      setStatusForm({ status: mapped.rawStatus, comment: '' })
      await fetchDriversForReassign()
    } catch (err) {
      setLoadError(apiErrorMessage(err, 'تعذّر تحميل تفاصيل الطلب.'))
      setTimeout(() => setLoadError(''), 3000)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!selectedOrder || !statusForm.status) return
    setActionLoading(true)
    setActionError('')
    try {
      await updateOrderStatus(selectedOrder.orderId, {
        status: statusForm.status,
        comment: statusForm.comment?.trim() || undefined,
      })
      await refreshSelectedOrder(selectedOrder.orderId)
      setActionMessage('تم تحديث حالة الطلب.')
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setActionError(apiErrorMessage(err, 'تعذّر تحديث حالة الطلب.'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelOrder = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return
    if (cancelReason.trim().length < 5) {
      setActionError('سبب الإلغاء مطلوب (5 أحرف على الأقل).')
      return
    }
    setActionLoading(true)
    setActionError('')
    try {
      await cancelOrder(selectedOrder.orderId, cancelReason.trim())
      await refreshSelectedOrder(selectedOrder.orderId)
      setShowCancelForm(false)
      setCancelReason('')
      setActionMessage('تم إلغاء الطلب.')
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setActionError(apiErrorMessage(err, 'تعذّر إلغاء الطلب.'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReassign = async (withDriver = true) => {
    if (!selectedOrder) return
    if (withDriver && reassignDriverId) {
      const driver = drivers.find(
        (d) => String(d.profileId ?? d.id) === String(reassignDriverId),
      )
      const driverProfileId = driver?.profileId ?? driver?.id ?? reassignDriverId
      if (!driverProfileId) {
        setActionError('تعذّر تحديد السائق. أعد تحميل التفاصيل وحاول مجدداً.')
        return
      }
      setActionLoading(true)
      setActionError('')
      try {
        await reassignOrder(selectedOrder.orderId, driverProfileId)
        await refreshSelectedOrder(selectedOrder.orderId)
        setActionMessage('تم تعيين السائق للطلب.')
        setTimeout(() => setActionMessage(''), 3000)
      } catch (err) {
        setActionError(apiErrorMessage(err, 'تعذّر إعادة تعيين السائق.'))
      } finally {
        setActionLoading(false)
      }
      return
    }

    setActionLoading(true)
    setActionError('')
    try {
      await reassignOrder(selectedOrder.orderId, null)
      await refreshSelectedOrder(selectedOrder.orderId)
      setActionMessage(withDriver && reassignDriverId ? 'تم تعيين السائق للطلب.' : 'تم إعادة توجيه الطلب.')
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setActionError(apiErrorMessage(err, 'تعذّر إعادة تعيين السائق.'))
    } finally {
      setActionLoading(false)
    }
  }

  const formatAmount = (value) => `${Number(value).toLocaleString('ar-LY')} د.ل`

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500 relative">

      <div className="flex flex-col items-start gap-1 border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white">إدارة الطلبات</h1>
        <p className="text-sm text-white/60">إدارة شاملة لجميع الطلبات في المنصة</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <ShoppingCart className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">الطلبات الجديدة</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.newOrders}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500">
            <Truck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">قيد الشحن</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.shipping}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <CheckCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">تم التسليم</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.delivered}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <XCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">الطلبات الملغاة</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.cancelled}</p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <select
          value={activeStatus}
          onChange={(e) => setActiveStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option>جميع الحالات</option>
          <option>قيد التنفيذ</option>
          <option>قيد الشحن</option>
          <option>تم التسليم</option>
          <option>ملغي</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث برقم الطلب أو هاتف الزبون..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-brand-300 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-brand-200 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm ">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 font-medium">رقم الطلب</th>
                <th className="px-3 py-3 font-medium">الزبون</th>
                <th className="px-3 py-3 font-medium">المتجر</th>
                <th className="px-3 py-3 font-medium text-center">الإجمالي</th>
                <th className="px-3 py-3 font-medium text-center">الدفع</th>
                <th className="px-3 py-3 font-medium">التاريخ</th>
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
                      جاري تحميل الطلبات...
                    </span>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-bold text-white">{order.id}</td>
                  <td className="px-3 py-3 text-white/70">{order.customer}</td>
                  <td className="px-3 py-3 text-white/70">{order.store}</td>
                  <td className="px-3 py-3 font-bold text-white text-center">{formatAmount(order.total)}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="size-5 flex items-center justify-center rounded bg-brand-100 text-brand-500">
                        {order.payment === 'محفظة'
                          ? <CreditCard className="size-3" />
                          : <Banknote className="size-3" />}
                      </div>
                      <span className="text-[10px] text-white/60">{order.payment}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-white/60 font-mono text-xs">{order.date}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block rounded-full px-3 py-1.5 text-[11px] font-bold ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openDetails(order)}
                      className="icon-btn-view"
                      title="عرض التفاصيل"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-white/60">
                    {loadError || 'لا توجد طلبات مطابقة للبحث أو الفلتر.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-brand-300/50 text-left">
          <p className="text-sm text-white/60">
            عرض {filteredOrders.length} من {stats.total} طلب
          </p>
        </div>
      </div>

      {detailsModalOpen && selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل الطلب</h2>
              <button type="button" onClick={closeDetails} className="text-white/50 hover:text-white/70 transition-colors">
                <XCircle className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-white/60">
                  <Loader2 className="size-6 animate-spin" />
                  <span>جاري تحميل التفاصيل...</span>
                </div>
              ) : (
              <>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedOrder.id}</h3>
                  <p className="text-sm text-white/60 mt-1">{selectedOrder.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <User className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">الزبون</p>
                    <p className="font-bold text-white">{selectedOrder.customer}</p>
                    {selectedOrder.customerPhone !== '—' ? (
                      <p className="text-xs text-white/50 mt-1 flex items-center gap-1 justify-end">
                        <Phone className="size-3" />
                        {selectedOrder.customerPhone}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <Store className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">المتجر</p>
                    <p className="font-bold text-white">{selectedOrder.store}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <Package className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">المنتجات</p>
                    <p className="font-bold text-white">{selectedOrder.products}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-100 border border-brand-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-brand-200 flex items-center justify-center text-brand-500">
                    <CreditCard className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-brand-500 mb-0.5">الإجمالي والدفع</p>
                    <p className="font-bold text-white">
                      {formatAmount(selectedOrder.total)} ({selectedOrder.payment})
                    </p>
                  </div>
                </div>
              </div>

              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                <div className="rounded-xl border border-white/10 bg-brand-300/50 overflow-hidden">
                  <div className="border-b border-white/10 px-4 py-3">
                    <h3 className="text-sm font-bold text-white/80">منتجات الطلب</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span className="font-bold text-emerald-500" dir="ltr">
                          {formatAmount(item.total ?? item.price)}
                        </span>
                        <div className="text-right">
                          <p className="font-medium text-white">{item.product_name ?? 'منتج'}</p>
                          <p className="text-xs text-white/50">
                            الكمية: {item.quantity} · {formatAmount(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedOrder.cancellationReason ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  سبب الإلغاء: {selectedOrder.cancellationReason}
                </div>
              ) : null}

              {actionMessage ? (
                <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
                  {actionMessage}
                </p>
              ) : null}
              {actionError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {actionError}
                </p>
              ) : null}

              {selectedOrder.rawStatus !== 'cancelled' && selectedOrder.rawStatus !== 'returned' ? (
                <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-5">
                  <h3 className="text-sm font-bold text-white/80">إجراءات الطلب</h3>

                  <form className="space-y-3" onSubmit={handleUpdateStatus}>
                    <p className="text-xs text-white/60">تحديث حالة الطلب</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={statusForm.status}
                        onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}
                        className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                      >
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={statusForm.comment}
                        onChange={(e) => setStatusForm((prev) => ({ ...prev, comment: e.target.value }))}
                        placeholder="تعليق اختياري..."
                        className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="rounded-xl bg-brand-900 px-4 py-2 text-sm font-bold text-white hover:bg-brand-950 disabled:opacity-60"
                    >
                      {actionLoading ? 'جاري الحفظ...' : 'تحديث الحالة'}
                    </button>
                  </form>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <p className="text-xs text-white/60">إعادة تعيين سائق التوصيل</p>
                    <select
                      value={reassignDriverId}
                      onChange={(e) => setReassignDriverId(e.target.value)}
                      disabled={driversLoading}
                      className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    >
                      <option value="">تعيين تلقائي (FIFO)</option>
                      {drivers.map((d) => {
                        const assignId = d.profileId ?? d.id
                        return (
                          <option key={assignId} value={assignId}>
                            {d.name} — {d.phone}
                          </option>
                        )
                      })}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleReassign(true)}
                        disabled={actionLoading}
                        className="rounded-xl bg-brand-900 px-4 py-2 text-sm font-bold text-white hover:bg-brand-950 disabled:opacity-60"
                      >
                        {reassignDriverId ? 'تعيين السائق المحدد' : 'إعادة توجيه تلقائي'}
                      </button>
                    </div>
                  </div>

                  {!showCancelForm ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCancelForm(true)
                        setActionError('')
                      }}
                      className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 hover:bg-red-500/20"
                    >
                      إلغاء الطلب
                    </button>
                  ) : (
                    <form className="space-y-3" onSubmit={handleCancelOrder}>
                      <p className="text-xs text-white/60">إلغاء الطلب مع ذكر السبب</p>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={3}
                        placeholder="سبب الإلغاء (5 أحرف على الأقل)..."
                        className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500 resize-none"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          تأكيد الإلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCancelForm(false)
                            setCancelReason('')
                          }}
                          className="rounded-xl border border-white/10 bg-brand-300 px-4 py-2 text-sm font-bold text-white/80"
                        >
                          تراجع
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : null}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  إغلاق النافذة
                </button>
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

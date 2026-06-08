import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search,
  MessageSquare,
  CheckCircle2,
  Eye,
  AlertCircle,
  Calendar,
  Package,
  Store,
  User,
  Camera,
  X,
  Send,
  DollarSign,
  ShieldAlert,
  Loader2,
} from 'lucide-react'
import {
  getComplaints,
  getComplaint,
  closeComplaint,
  updateComplaintStatus,
  addComplaintReply,
  complaintFinancialAction,
  complaintAdminAction,
  extractComplaintList,
  mapComplaint,
  mapComplaintDetail,
  uiStatusFilterToApi,
  uiCategoryFilterToApi,
  uiStatusToApi,
  buildComplaintStats,
} from '../api/adminComplaints.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية إدارة الشكاوى.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function DisputesPage() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeStatusFilter, setActiveStatusFilter] = useState('الكل')
  const [activeTypeFilter, setActiveTypeFilter] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [replyText, setReplyText] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const loadSeq = useRef(0)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const loadDisputes = useCallback(async (query = searchQuery.trim(), statusFilter = activeStatusFilter, typeFilter = activeTypeFilter) => {
    const seq = ++loadSeq.current
    const params = { per_page: 100 }
    const search = query.trim()
    if (search) params.search = search
    const status = uiStatusFilterToApi(statusFilter)
    if (status) params.status = status
    const category = uiCategoryFilterToApi(typeFilter)
    if (category) params.category = category

    const data = await getComplaints(params)
    if (seq !== loadSeq.current) return
    setDisputes(extractComplaintList(data).map(mapComplaint))
  }, [searchQuery, activeStatusFilter, activeTypeFilter])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadDisputes()
      } catch (err) {
        setDisputes([])
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل الشكاوى. تأكد من تسجيل الدخول وأن الخادم يعمل.'))
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, activeStatusFilter, activeTypeFilter, loadDisputes])

  const stats = buildComplaintStats(disputes)

  async function fetchComplaintDetail(id) {
    const data = await getComplaint(id)
    return mapComplaintDetail(data)
  }

  async function openDetailsModal(dispute) {
    setReplyText('')
    setSelectedDispute(dispute)
    setDetailsModalOpen(true)
    setDetailLoading(true)
    try {
      const detail = await fetchComplaintDetail(dispute.id)
      setSelectedDispute(detail)
      setDisputes((prev) => prev.map((d) => (d.id === detail.id ? { ...d, ...detail } : d)))
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحميل تفاصيل الشكوى.'))
    } finally {
      setDetailLoading(false)
    }
  }

  async function openProductImage(dispute) {
    setActionLoading(true)
    try {
      let detail = dispute
      if (!detail.attachments?.length) {
        detail = await fetchComplaintDetail(dispute.id)
        setDisputes((prev) => prev.map((d) => (d.id === detail.id ? { ...d, ...detail } : d)))
        if (selectedDispute?.id === detail.id) setSelectedDispute(detail)
      }
      if (!detail.imageUrl) {
        triggerToast('لا توجد صورة مرفقة لهذه الشكوى.')
        return
      }
      setImageUrl(detail.imageUrl)
      setSelectedDispute(detail)
      setShowImageModal(true)
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحميل صورة المنتج.'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCloseComplaint(dispute, closeModal = false) {
    setActionLoading(true)
    try {
      const result = await closeComplaint(dispute.id, {})
      const updated = mapComplaint(result?.data ?? result)
      setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      if (selectedDispute?.id === updated.id) setSelectedDispute(updated)
      triggerToast('تم إغلاق الشكوى بنجاح')
      if (closeModal) setDetailsModalOpen(false)
      await loadDisputes()
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر إغلاق الشكوى.'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStatusChange(newStatusLabel) {
    if (!selectedDispute) return
    const apiStatus = uiStatusToApi(newStatusLabel)
    if (!apiStatus) return

    setActionLoading(true)
    try {
      const result = await updateComplaintStatus(selectedDispute.id, apiStatus)
      const updated = mapComplaint(result?.data ?? result)
      setSelectedDispute(updated)
      setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      triggerToast(`تم تحديث الحالة إلى ${updated.status}`)
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحديث حالة الشكوى.'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSendReply() {
    if (!selectedDispute || !replyText.trim()) return
    setActionLoading(true)
    try {
      await addComplaintReply(selectedDispute.id, replyText.trim())
      setReplyText('')
      triggerToast('تم إرسال الرد بنجاح')
      const detail = await fetchComplaintDetail(selectedDispute.id)
      setSelectedDispute(detail)
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر إرسال الرد.'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAction(actionName) {
    if (!selectedDispute) return
    setActionLoading(true)
    try {
      if (actionName === 'close') {
        await handleCloseComplaint(selectedDispute, true)
        return
      }

      if (actionName === 'refund') {
        await complaintFinancialAction(selectedDispute.id, {
          type: 'refund_to_customer',
          amount: 1,
          customer_id: selectedDispute.customerId,
        })
        triggerToast('تم طلب استرداد المبلغ للزبون بنجاح')
        return
      }

      if (actionName === 'deduct') {
        await complaintFinancialAction(selectedDispute.id, {
          type: 'deduction_from_merchant',
          amount: 1,
          customer_id: selectedDispute.customerId,
          store_id: selectedDispute.raw?.order?.store_id,
        })
        triggerToast('تم خصم المبلغ من التاجر بنجاح')
        return
      }

      if (actionName === 'ban_customer') {
        await complaintAdminAction(selectedDispute.id, {
          action_type: 'ban',
          user_id: selectedDispute.customerId,
          reason: 'إجراء إداري من لوحة الشكاوى',
        })
        triggerToast('تم حظر الزبون بنجاح')
        return
      }

      if (actionName === 'ban_store' || actionName === 'warn_merchant') {
        await complaintAdminAction(selectedDispute.id, {
          action_type: actionName === 'ban_store' ? 'ban' : 'escalate_complaint',
          reason: actionName === 'ban_store' ? 'حظر متجر بسبب شكوى' : 'تحذير للتاجر بسبب شكوى',
        })
        triggerToast(actionName === 'ban_store' ? 'تم تنفيذ إجراء حظر المتجر' : 'تم إرسال تحذير للتاجر')
        return
      }

      triggerToast('تم تنفيذ الإجراء بنجاح')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تنفيذ الإجراء.'))
    } finally {
      setActionLoading(false)
    }
  }

  const statusBadgeClass = (status) => {
    if (status === 'مفتوحة') return 'bg-red-100 text-red-700'
    if (status === 'قيد المراجعة') return 'bg-yellow-100 text-yellow-700'
    if (status === 'تم الحل') return 'bg-emerald-100 text-emerald-700'
    return 'bg-brand-300 text-white/80'
  }

  const typeBadgeClass = (type) => {
    if (type === 'استرجاع') return 'bg-brand-300 text-brand-700'
    if (type === 'نزاع') return 'bg-yellow-100 text-yellow-700'
    return 'bg-brand-300 text-white/80'
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 animate-in fade-in duration-500 relative">
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle2 className="size-5" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start gap-2 border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white">الشكاوى والنزاعات</h1>
        <p className="text-sm text-white/60">إدارة شكاوى الزبائن والنزاعات بين الأطراف</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-brand-500">
            <MessageSquare className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">متوسط وقت الحل</p>
          <p className="mt-1 text-2xl font-bold text-white">—</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-emerald-500">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">تم الحل</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.resolved}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-yellow-500">
            <Eye className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">قيد المراجعة</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.review}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">الشكاوى المفتوحة</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.open}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-brand-200 p-3 shadow-premium">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث في الشكاوى (رقم الشكوى، الزبون، المتجر، رقم الطلب، الوصف)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-0 bg-transparent py-2 pl-4 pr-11 text-sm outline-none placeholder:text-white/50 focus:ring-0 text-right"
            dir="rtl"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-6 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium" dir="rtl">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-white/80">الحالة:</span>
          {['الكل', 'مفتوحة', 'قيد المراجعة', 'تم الحل', 'مغلقة'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatusFilter(status)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeStatusFilter === status
                  ? 'bg-brand-900 text-white'
                  : 'bg-brand-300 text-white/70 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-slate-200 hidden md:block" />
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-white/80">النوع:</span>
          {['الكل', 'استرجاع', 'بلاغ', 'نزاع'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveTypeFilter(type)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTypeFilter === type
                  ? 'bg-brand-900 text-white'
                  : 'bg-brand-300 text-white/70 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <p className="text-center text-sm text-rose-400">{loadError}</p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-brand-200 py-12 text-white/70">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm font-medium">جاري تحميل الشكاوى...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-brand-200 py-12 text-center text-sm text-white/60">
              لا توجد شكاوى مطابقة للبحث أو الفلترة.
            </p>
          ) : (
            disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium transition-shadow hover:shadow-premium"
              >
                <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1 order-2 md:order-1 text-right w-full">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 flex-row-reverse mb-2">
                      شكوى <span className="text-white/80">{dispute.displayId}</span>
                    </h3>
                    <p className="text-base font-medium text-white/90 mb-4">{dispute.subject}</p>
                    <div className="flex flex-wrap items-center justify-end gap-6 text-sm text-white/70">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <User className="size-4 text-purple-500" />
                        <span>{dispute.customer}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Store className="size-4 text-pink-500" />
                        <span>{dispute.store}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Package className="size-4 text-orange-400" />
                        <span className="font-mono text-xs">{dispute.orderId}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <Calendar className="size-4 text-brand-400" />
                        <span>{dispute.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 w-full md:w-auto order-1 md:order-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeBadgeClass(dispute.type)}`}>
                        {dispute.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass(dispute.status)}`}>
                        {dispute.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => openProductImage(dispute)}
                        disabled={actionLoading}
                        className="btn-action-solid gap-1 px-3 py-1.5 text-xs disabled:opacity-60"
                      >
                        صورة مرفقة <Camera className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDetailsModal(dispute)}
                        className="btn-action-solid gap-1 px-3 py-1.5 text-xs"
                      >
                        عرض التفاصيل <Eye className="size-3" />
                      </button>
                      {dispute.rawStatus !== 'closed' && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleCloseComplaint(dispute)}
                          className="px-4 py-1.5 rounded-lg text-sm font-bold text-white bg-brand-300 hover:bg-brand-100 transition-colors shadow-premium border border-white/10 disabled:opacity-60"
                        >
                          إغلاق
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {dispute.hasImage && dispute.imageUrl ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => openProductImage(dispute)}
                    onKeyDown={(e) => e.key === 'Enter' && openProductImage(dispute)}
                    className="mt-4 rounded-xl border border-brand-100 bg-brand-100/50 p-4 flex items-center justify-between cursor-pointer hover:bg-brand-300 transition-colors group"
                    dir="rtl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-16 rounded-lg bg-brand-200 border border-white/10 shadow-premium overflow-hidden flex items-center justify-center">
                        <img
                          src={dispute.imageUrl}
                          alt="Product"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white/90">صورة المنتج من الزبون</h4>
                        <p className="text-xs text-white/60 mt-1">تم إرفاق صورة توضيحية للمنتج - اضغط للتكبير</p>
                      </div>
                    </div>
                    <div className="size-8 rounded-full bg-brand-200 flex items-center justify-center text-white shadow-premium">
                      <Search className="size-4" />
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}

      {detailsModalOpen && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto py-10">
          <div className="w-full max-w-4xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between border-b border-white/5 p-6" dir="rtl">
              <h2 className="text-2xl font-bold text-white">تفاصيل الشكوى</h2>
              <button type="button" onClick={() => setDetailsModalOpen(false)} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-3 py-20 text-white/70">
                <Loader2 className="size-6 animate-spin" />
                <span>جاري تحميل التفاصيل...</span>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center text-right border-b border-white/5 pb-4" dir="rtl">
                  <div className="flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${typeBadgeClass(selectedDispute.type)}`}>
                      {selectedDispute.type}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${statusBadgeClass(selectedDispute.status)}`}>
                      {selectedDispute.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-white">شكوى {selectedDispute.displayId}</h3>
                    <p className="text-sm text-white/60 mt-1">{selectedDispute.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
                  <div className="rounded-xl bg-brand-100/50 border border-brand-100 p-5 text-right">
                    <p className="text-sm text-brand-400 mb-1">الزبون</p>
                    <p className="font-bold text-white text-lg">{selectedDispute.customer}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-5 text-right">
                    <p className="text-sm text-emerald-500 mb-1">المتجر</p>
                    <p className="font-bold text-white text-lg">{selectedDispute.store}</p>
                  </div>
                  <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-5 text-right">
                    <p className="text-sm text-purple-400 mb-1">رقم الطلب</p>
                    <p className="font-bold text-white text-lg">{selectedDispute.orderId}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right" dir="rtl">
                  <p className="text-sm text-white/60 mb-2">وصف الشكوى</p>
                  <p className="font-bold text-white text-lg">{selectedDispute.description}</p>
                </div>

                {selectedDispute.hasImage && selectedDispute.imageUrl ? (
                  <div className="rounded-xl border border-brand-200 bg-brand-200 overflow-hidden text-right" dir="rtl">
                    <div className="p-3 bg-brand-100/50 border-b border-brand-100">
                      <p className="text-sm font-bold text-white/70">صورة المنتج المرفقة من الزبون</p>
                    </div>
                    <div className="p-6 flex flex-col items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl(selectedDispute.imageUrl)
                          setShowImageModal(true)
                        }}
                        className="w-full max-w-md h-64 rounded-2xl bg-brand-300 border-2 border-white/5 shadow-inner overflow-hidden cursor-pointer hover:ring-2 ring-brand-400 transition-all mb-4"
                      >
                        <img
                          src={selectedDispute.imageUrl}
                          alt="Product Detail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <p className="text-sm font-medium text-white/80">صورة توضيحية للمنتج موضوع الشكوى</p>
                    </div>
                  </div>
                ) : null}

                {selectedDispute.rawStatus !== 'closed' && (
                  <div className="mt-6 space-y-4" dir="rtl">
                    <h3 className="text-lg font-bold text-white mb-2 border-b border-white/10 pb-2">الرد وتحديث الحالة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-white/70 mb-2">تعديل حالة الشكوى</label>
                        <select
                          value={selectedDispute.status}
                          disabled={actionLoading}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-brand-300 py-2.5 px-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
                        >
                          <option value="مفتوحة">مفتوحة</option>
                          <option value="قيد المراجعة">قيد المراجعة</option>
                          <option value="بانتظار الرد">بانتظار الرد</option>
                          <option value="تم الحل">تم الحل</option>
                          <option value="ملغاة">ملغاة</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/70 mb-2">إضافة رد</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="اكتب ردك هنا..."
                            disabled={actionLoading}
                            className="flex-1 rounded-xl border border-white/10 bg-brand-300 py-2.5 px-3 text-sm text-white outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
                          />
                          <button
                            type="button"
                            onClick={handleSendReply}
                            disabled={actionLoading || !replyText.trim()}
                            className="rounded-xl bg-brand-100 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-300 transition-colors shadow-premium border border-white/10 flex items-center gap-2 shrink-0 disabled:opacity-60"
                          >
                            <Send className="size-4" />
                            إرسال
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-bold text-white text-right mb-4 border-b border-white/10 pb-2" dir="rtl">
                    الإجراءات المتاحة
                  </h3>
                  <div className="space-y-6">
                    <div dir="rtl">
                      <p className="text-sm font-bold text-white/60 flex items-center gap-2 mb-3">
                        إجراء مالي <DollarSign className="size-4" />
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAction('refund')}
                          className="w-full rounded-xl bg-brand-100 py-4 text-center font-bold text-white hover:bg-brand-300 transition-colors shadow-premium text-lg border border-white/10 disabled:opacity-60"
                        >
                          استرداد للزبون
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAction('deduct')}
                          className="w-full rounded-xl bg-brand-100 py-4 text-center font-bold text-white hover:bg-brand-300 transition-colors shadow-premium text-lg border border-white/10 disabled:opacity-60"
                        >
                          خصم من التاجر
                        </button>
                      </div>
                    </div>
                    <div dir="rtl">
                      <p className="text-sm font-bold text-white/60 flex items-center gap-2 mb-3">
                        إجراء إداري <ShieldAlert className="size-4" />
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button type="button" disabled={actionLoading} onClick={() => handleAction('ban_store')} className="w-full rounded-xl bg-brand-100 py-4 font-bold text-white hover:bg-brand-300 border border-white/10 disabled:opacity-60">
                          حظر المتجر
                        </button>
                        <button type="button" disabled={actionLoading} onClick={() => handleAction('warn_merchant')} className="w-full rounded-xl bg-brand-100 py-4 font-bold text-white hover:bg-brand-300 border border-white/10 disabled:opacity-60">
                          تحذير التاجر
                        </button>
                        <button type="button" disabled={actionLoading} onClick={() => handleAction('ban_customer')} className="w-full rounded-xl bg-brand-100 py-4 font-bold text-white hover:bg-brand-300 border border-white/10 disabled:opacity-60">
                          حظر الزبون
                        </button>
                        <button type="button" disabled={actionLoading} onClick={() => handleAction('close')} className="w-full rounded-xl bg-brand-100 py-4 font-bold text-white hover:bg-brand-300 border border-white/10 disabled:opacity-60">
                          إغلاق الشكوى
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showImageModal && imageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <button
            type="button"
            onClick={() => setShowImageModal(false)}
            className="absolute top-6 right-6 size-12 flex items-center justify-center rounded-full bg-brand-200/10 text-white hover:bg-brand-200/20 transition-colors"
          >
            <X className="size-6" />
          </button>
          <div className="relative max-w-4xl w-full max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <img src={imageUrl} alt="صورة المنتج المرفقة" className="w-full h-full object-contain bg-slate-800" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white text-right" dir="rtl">
              <h3 className="text-xl font-bold">معاينة الصورة المرفقة</h3>
              <p className="text-sm text-slate-300 mt-1">
                صورة المنتج من الزبون — شكوى {selectedDispute?.displayId}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

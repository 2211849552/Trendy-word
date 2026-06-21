import { useState } from 'react'
import { Search, SlidersHorizontal, Eye, Power, CheckCircle, Download } from 'lucide-react'
import { StoreDetailModal } from './StoreDetailModal.jsx'
import { StoreImage } from './StoreImage.jsx'

const STATUS_LABELS = {
  active: 'نشط',
  disabled: 'معطل',
  pending: 'معلق',
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPrintHtml(stores) {
  const rows = stores
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.merchant)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.phone)}</td>
          <td>${escapeHtml(row.city)}</td>
          <td>${escapeHtml(STATUS_LABELS[row.status] ?? row.rawStatus ?? row.status)}</td>
          <td>${escapeHtml(row.createdAt || '—')}</td>
        </tr>
      `,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>قائمة المتاجر</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { text-align: center; margin-bottom: 8px; }
    p { text-align: center; color: #666; margin-bottom: 24px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 13px; }
    th { background: #f5f5f5; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <h1>قائمة المتاجر</h1>
  <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-LY')}</p>
  <table>
    <thead>
      <tr>
        <th>المتجر</th>
        <th>التاجر</th>
        <th>البريد</th>
        <th>الهاتف</th>
        <th>المنطقة</th>
        <th>الحالة</th>
        <th>تاريخ الإنشاء</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="7" style="text-align:center">لا توجد متاجر</td></tr>'}</tbody>
  </table>
</body>
</html>`
}

function openPrintWindow(stores) {
  const html = buildPrintHtml(stores)

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'طباعة قائمة المتاجر')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!frameDoc) {
    document.body.removeChild(iframe)
    throw new Error('تعذّر تجهيز صفحة الطباعة.')
  }

  frameDoc.open()
  frameDoc.write(html)
  frameDoc.close()

  const printFrame = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } finally {
      window.setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
      }, 1000)
    }
  }

  if (iframe.contentWindow?.document.readyState === 'complete') {
    printFrame()
  } else {
    iframe.onload = printFrame
  }
}

export function StoreListView({
  stores,
  loading = false,
  loadError = '',
  query,
  status,
  onQueryChange,
  onStatusChange,
  onToggleStoreStatus,
  onLoadStoreDetails,
  onUpdateStore,
  onSettleCustody,
  onPrintStores,
  canEditDeliveryPrices = false,
  canViewStoreProducts = false,
  canViewStorePromotions = false,
  onBackToJoin,
}) {
  const [toggleStore, setToggleStore] = useState(null)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const showStatusToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const confirmToggle = async () => {
    if (!toggleStore) return
    if (toggleStore.status === 'active' && !deactivateReason.trim()) {
      setActionError('سبب التعطيل مطلوب.')
      return
    }

    setActionLoading(true)
    setActionError('')
    try {
      await onToggleStoreStatus(toggleStore, deactivateReason.trim())
      showStatusToast(
        toggleStore.status === 'active'
          ? 'تم إلغاء تفعيل المتجر بنجاح'
          : 'تم إعادة تفعيل المتجر بنجاح',
      )
      setToggleStore(null)
      setDeactivateReason('')
    } catch (err) {
      setActionError(err?.message || 'تعذّر تحديث حالة المتجر.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenDetails = async (row) => {
    setDetailModalOpen(true)
    setDetailLoading(true)
    setSelectedStore(row)
    try {
      const details = await onLoadStoreDetails(row.id)
      if (details) setSelectedStore(details)
    } finally {
      setDetailLoading(false)
    }
  }

  const handlePrint = async () => {
    setPrintLoading(true)
    try {
      const printableStores = await onPrintStores()
      openPrintWindow(printableStores)
    } catch (err) {
      showStatusToast(err?.message || 'تعذّر طباعة قائمة المتاجر.')
    } finally {
      setPrintLoading(false)
    }
  }

  return (
    <>
      {toggleStore && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setToggleStore(null)
              setDeactivateReason('')
              setActionError('')
            }}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 bg-brand-300/50 px-5 py-4">
              <h2 className="text-lg font-bold text-white">تأكيد تغيير حالة المتجر</h2>
              <button
                onClick={() => {
                  setToggleStore(null)
                  setDeactivateReason('')
                  setActionError('')
                }}
                className="rounded-lg p-1.5 text-white/50 hover:bg-brand-300 hover:text-white/70 transition-colors"
              >
                <Power className="size-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl ${toggleStore.status === 'active' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Power className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-white">هل أنت متأكد؟</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {toggleStore.status === 'active'
                    ? <>أنت على وشك <span className="font-bold text-white">إلغاء تفعيل</span> المتجر <span className="font-bold text-white">«{toggleStore.name}»</span>.</>
                    : <>أنت على وشك <span className="font-bold text-white">إعادة تفعيل</span> المتجر <span className="font-bold text-white">«{toggleStore.name}»</span>.</>}
                </p>
              </div>

              {toggleStore.status === 'active' ? (
                <div className="mt-5">
                  <label htmlFor="deactivate-reason" className="mb-2 block text-sm font-medium text-white/80">
                    سبب التعطيل <span className="text-brand-300">*</span>
                  </label>
                  <textarea
                    id="deactivate-reason"
                    value={deactivateReason}
                    onChange={(e) => setDeactivateReason(e.target.value)}
                    rows={3}
                    placeholder="اكتبي سبب تعطيل المتجر..."
                    className="w-full rounded-xl border border-white/10 bg-brand-300/80 px-4 py-3 text-sm text-white outline-none ring-brand-500/30 focus:border-brand-300 focus:ring-2"
                  />
                </div>
              ) : null}

              {actionError ? (
                <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {actionError}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 p-5 bg-brand-300 border-t border-white/5 sm:flex-row-reverse sm:gap-3">
              <button
                type="button"
                onClick={confirmToggle}
                disabled={actionLoading}
                className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-bold text-white shadow-premium transition-colors disabled:opacity-60 ${toggleStore.status === 'active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {actionLoading ? 'جاري التنفيذ...' : toggleStore.status === 'active' ? 'إلغاء التفعيل' : 'إعادة التفعيل'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setToggleStore(null)
                  setDeactivateReason('')
                  setActionError('')
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-brand-200 px-4 text-sm font-bold text-white/80 shadow-premium hover:bg-brand-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle className="size-5" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            إدارة المتاجر
          </h1>
          <p className="mt-1 text-white/60">قائمة المتاجر المسجلة في المنصة</p>
        </header>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToJoin}
            className="rounded-xl border border-brand-200 bg-brand-200 px-4 py-2.5 text-sm font-semibold text-white shadow-premium transition-colors hover:bg-brand-100"
          >
            طلبات الانضمام
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={printLoading}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
          >
            <Download className="size-4" aria-hidden />
            {printLoading ? 'جاري التحضير...' : 'طباعة قائمة المتاجر'}
          </button>
        </div>
      </div>

      <div
        className="mb-6 flex flex-col gap-3 rounded-2xl bg-brand-200 p-4 shadow-premium ring-1 ring-slate-100/80 sm:flex-row sm:items-center sm:justify-between"
        dir="rtl"
      >
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">البحث عن متجر</span>
          <Search className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-white/50" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="البحث عن متجر..."
            className="w-full rounded-xl border border-white/10 bg-brand-300/80 py-2.5 pe-11 ps-3 text-sm text-white outline-none ring-brand-500/30 transition focus:border-brand-300 focus:bg-brand-200 focus:ring-2"
          />
        </label>
        <div className="flex shrink-0 items-center gap-2">
          <SlidersHorizontal className="size-5 text-white/50" aria-hidden />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-brand-200 py-2.5 ps-3 pe-8 text-sm font-medium text-white/80 shadow-premium outline-none ring-brand-500/30 focus:ring-2"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="disabled">معطل</option>
            <option value="pending">معلق</option>
          </select>
        </div>
      </div>

      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      ) : null}

      <section
        className="overflow-hidden rounded-2xl bg-brand-200 shadow-premium ring-1 ring-slate-100/80"
        dir="rtl"
      >
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">قائمة المتاجر</h2>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-0 text-right text-sm print:min-w-full">
            <thead>
              <tr className="border-b border-white/5 bg-brand-300/80 text-white/70">
                <th className="px-3 py-2 font-semibold">المتجر</th>
                <th className="px-3 py-2 font-semibold">التاجر</th>
                <th className="px-3 py-2 font-semibold">البريد الإلكتروني</th>
                <th className="px-3 py-2 font-semibold">الهاتف</th>
                <th className="px-3 py-2 font-semibold print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-12 text-center text-sm text-white/55">
                    جاري تحميل المتاجر...
                  </td>
                </tr>
              ) : (
                stores.map((row) => (
                  <tr key={row.id} className={`transition-colors hover:bg-brand-300/60 ${row.status === 'disabled' ? 'opacity-60' : ''}`}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <StoreImage
                          src={row.image}
                          name={row.name}
                          className="size-11 shrink-0 rounded-xl ring-1 ring-slate-100 print:hidden"
                        />
                        <div>
                          <div className="font-semibold text-white">{row.name}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-white/60">{row.city}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${
                              row.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : row.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {STATUS_LABELS[row.status] ?? row.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-white/80">{row.merchant}</td>
                    <td className="px-3 py-3 text-white/70 tabular-nums" dir="ltr">
                      {row.email}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-white/80" dir="ltr">
                      {row.phone}
                    </td>
                    <td className="px-3 py-3 print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(row)}
                          className="flex size-9 items-center justify-center rounded-lg bg-brand-950 text-white shadow-premium transition-colors hover:bg-brand-800"
                          aria-label={`عرض تفاصيل ${row.name}`}
                        >
                          <Eye className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className={`flex size-9 items-center justify-center rounded-lg border shadow-premium transition-colors ${row.status === 'active' ? 'border-white/10 bg-brand-200 text-white/50 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600' : 'border-white/10 bg-brand-200 text-white/50 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600'}`}
                          aria-label={row.status === 'active' ? 'إلغاء تفعيل' : 'إعادة تفعيل'}
                          onClick={() => {
                            setToggleStore(row)
                            setDeactivateReason('')
                            setActionError('')
                          }}
                        >
                          <Power className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && stores.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-white/60">
            لا توجد متاجر مطابقة للبحث أو الفلتر.
          </p>
        ) : null}
      </section>

      <StoreDetailModal
        store={selectedStore}
        open={detailModalOpen}
        loading={detailLoading}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedStore(null)
        }}
        onSettleCustody={onSettleCustody}
        canEditDeliveryPrices={canEditDeliveryPrices}
        canViewStoreProducts={canViewStoreProducts}
        canViewStorePromotions={canViewStorePromotions}
        onStoreUpdated={(updated) => setSelectedStore(updated)}
      />
    </>
  )
}

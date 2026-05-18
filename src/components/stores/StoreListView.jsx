import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Eye, Trash2, CheckCircle, Download } from 'lucide-react'
import { StoreDetailModal } from './StoreDetailModal.jsx'
import { StoreImage } from './StoreImage.jsx'

export function StoreListView({ stores, onDeleteStore, onBackToJoin }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [deleteStore, setDeleteStore] = useState(null)
  const [selectedStore, setSelectedStore] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const filteredRows = useMemo(() => {
    return stores.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.merchant.toLowerCase().includes(query.toLowerCase())
      
      const matchesStatus = status === 'all' || s.status === status
      return matchesSearch && matchesStatus
    })
  }, [stores, query, status])

  const confirmDelete = () => {
    if (!deleteStore) return
    onDeleteStore(deleteStore.id)
    setDeleteStore(null)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      {deleteStore && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteStore(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">تأكيد حذف المتجر</h2>
              <button onClick={() => setDeleteStore(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <Trash2 className="size-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">هل أنت متأكد؟</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                أنت على وشك حذف المتجر <span className="font-bold text-slate-900">«{deleteStore.name}»</span> نهائياً من المنصة. لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-5 bg-slate-50 border-t border-slate-100 sm:flex-row-reverse sm:gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setDeleteStore(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle className="size-5" />
            <span className="font-bold">تم حذف المتجر بنجاح</span>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            إدارة المتاجر
          </h1>
          <p className="mt-1 text-slate-500">قائمة المتاجر المسجلة في المنصة</p>
        </header>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToJoin}
            className="rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-brand-50"
          >
            طلبات الانضمام
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Download className="size-4" aria-hidden />
            طباعة قائمة المتاجر
          </button>
        </div>
      </div>

      <div
        className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:flex-row sm:items-center sm:justify-between"
        dir="rtl"
      >
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">البحث عن متجر</span>
          <Search className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="البحث عن متجر..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pe-11 ps-3 text-sm text-slate-900 outline-none ring-brand-500/30 transition focus:border-brand-300 focus:bg-white focus:ring-2"
          />
        </label>
        <div className="flex shrink-0 items-center gap-2">
          <SlidersHorizontal className="size-5 text-slate-400" aria-hidden />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2.5 ps-3 pe-8 text-sm font-medium text-slate-700 shadow-sm outline-none ring-brand-500/30 focus:ring-2"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="disabled">معطل</option>
            <option value="pending">معلق</option>
          </select>
        </div>
      </div>

      <section
        className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100/80"
        dir="rtl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">قائمة المتاجر</h2>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[800px] text-right text-sm print:min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600">
                <th className="px-4 py-3 font-semibold">المتجر</th>
                <th className="px-4 py-3 font-semibold">التاجر</th>
                <th className="px-4 py-3 font-semibold">البريد الإلكتروني</th>
                <th className="px-4 py-3 font-semibold">الهاتف</th>
                <th className="px-4 py-3 font-semibold">المنتجات</th>
                <th className="px-4 py-3 font-semibold">الطلبات</th>
                <th className="px-4 py-3 font-semibold print:hidden">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <StoreImage
                        src={row.image}
                        name={row.name}
                        className="size-11 shrink-0 rounded-xl ring-1 ring-slate-100 print:hidden"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{row.name}</div>
                        <div className="text-xs text-slate-500">{row.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{row.merchant}</td>
                  <td className="px-4 py-4 text-slate-600 tabular-nums" dir="ltr">
                    {row.email}
                  </td>
                  <td className="px-4 py-4 tabular-nums text-slate-700" dir="ltr">
                    {row.phone}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 tabular-nums">
                      {row.products}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium tabular-nums text-slate-900">
                    {row.orders}
                  </td>
                  <td className="px-4 py-4 print:hidden">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStore(row)
                          setDetailModalOpen(true)
                        }}
                        className="flex size-9 items-center justify-center rounded-lg bg-brand-950 text-white shadow-sm transition-colors hover:bg-brand-800"
                        aria-label={`عرض تفاصيل ${row.name}`}
                      >
                        <Eye className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="حذف"
                        onClick={() => setDeleteStore(row)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            لا توجد متاجر مطابقة للبحث أو الفلتر.
          </p>
        ) : null}
      </section>

      <StoreDetailModal 
        store={selectedStore}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </>
  )
}

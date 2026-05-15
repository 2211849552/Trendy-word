import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Package } from 'lucide-react'

export function StoreProductsModal({ store, open, onClose }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !store) return null

  const rows = store.catalog ?? []

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-products-title"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Package className="size-5" aria-hidden />
            </span>
            <div>
              <h2 id="store-products-title" className="text-lg font-bold text-slate-900">
                منتجات المتجر
              </h2>
              <p className="text-sm text-slate-500">
                {store.name} — {store.city}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-5rem)] overflow-y-auto px-5 py-4">
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[560px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">المرجع</th>
                  <th className="px-4 py-3 font-semibold">اسم المنتج</th>
                  <th className="px-4 py-3 font-semibold">التصنيف</th>
                  <th className="px-4 py-3 font-semibold">السعر (د.ل)</th>
                  <th className="px-4 py-3 font-semibold">المخزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => (
                  <tr key={p.sku} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600" dir="ltr">
                      {p.sku}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.category}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-800">{p.price}</td>
                    <td className="px-4 py-3 tabular-nums font-medium text-slate-900">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">لا توجد منتجات مسجلة لهذا المتجر.</p>
          ) : null}
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}

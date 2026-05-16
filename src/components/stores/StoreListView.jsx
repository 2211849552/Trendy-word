import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Shirt, ShoppingBag, Sparkles, Eye, Trash2 } from 'lucide-react'
import { registeredStores } from '../../data/stores.js'


function RowIcon({ type }) {
  const cls = 'size-4 text-slate-600'
  if (type === 'bag') return <ShoppingBag className={cls} aria-hidden />
  if (type === 'sparkles') return <Sparkles className={cls} aria-hidden />
  return <Shirt className={cls} aria-hidden />
}

export function StoreListView({ onBackToJoin, onOpenProducts }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')


  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return registeredStores.filter((row) => {
      const matchesText =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.city.toLowerCase().includes(q) ||
        row.merchant.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || row.status === status
      return matchesText && matchesStatus
    })
  }, [query, status])

  return (
    <>


      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            إدارة المتاجر
          </h1>
          <p className="mt-1 text-slate-500">قائمة المتاجر المسجلة في المنصة</p>
        </header>
        <button
          type="button"
          onClick={onBackToJoin}
          className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          طلبات الانضمام
        </button>
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
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pe-11 ps-3 text-sm text-slate-900 outline-none ring-sky-500/30 transition focus:border-sky-300 focus:bg-white focus:ring-2"
          />
        </label>
        <div className="flex shrink-0 items-center gap-2">
          <SlidersHorizontal className="size-5 text-slate-400" aria-hidden />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2.5 ps-3 pe-8 text-sm font-medium text-slate-700 shadow-sm outline-none ring-sky-500/30 focus:ring-2"
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600">
                <th className="px-4 py-3 font-semibold">المتجر</th>
                <th className="px-4 py-3 font-semibold">التاجر</th>
                <th className="px-4 py-3 font-semibold">البريد الإلكتروني</th>
                <th className="px-4 py-3 font-semibold">الهاتف</th>
                <th className="px-4 py-3 font-semibold">المنتجات</th>
                <th className="px-4 py-3 font-semibold">الطلبات</th>
                <th className="px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <RowIcon type={row.icon} />
                      </span>
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
                      <Shirt className="size-3.5 text-slate-400" aria-hidden />
                      <ShoppingBag className="size-3.5 text-slate-400" aria-hidden />
                      {row.products}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium tabular-nums text-slate-900">
                    {row.orders}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenProducts?.(row.id)}
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        aria-label={`عرض منتجات ${row.name}`}
                      >
                        <Eye className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="حذف (تجريبي)"
                        onClick={() =>
                          window.alert('إجراء الحذف غير مفعّل في الواجهة التجريبية.')
                        }
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
    </>
  )
}

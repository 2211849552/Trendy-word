import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, ChevronDown, ArrowRight } from 'lucide-react'
import { registeredStores } from '../../data/stores.js'
import { CLOTHING_CATEGORIES } from '../../data/catalogData.js'

export function StoreProductsView({ storeId, onBack }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)

  const store = useMemo(
    () => registeredStores.find((s) => s.id === storeId) ?? null,
    [storeId],
  )

  const storeProducts = store?.catalog ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 border-b border-white/10 pb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg bg-brand-300 px-3 py-1.5 text-sm font-medium text-white/70 hover:bg-slate-200 transition-colors"
        >
          <ArrowRight className="size-4" />
          العودة للمتاجر
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">منتجات المتجر: {store?.name}</h1>
          <p className="text-sm text-white/60">إدارة كتالوج المنتجات الخاص بهذا المتجر</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="appearance-none rounded-xl border border-white/10 bg-brand-200 py-2.5 pl-4 pr-10 text-sm font-medium text-white/80 outline-none hover:bg-brand-300 focus:border-brand-500">
              <option>الكل</option>
              <option>متوفر</option>
              <option>نفد</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none rounded-xl border border-white/10 bg-brand-200 py-2.5 pl-4 pr-10 text-sm font-medium text-white/80 outline-none hover:bg-brand-300 focus:border-brand-500">
              <option>جميع التصنيفات</option>
              {CLOTHING_CATEGORIES.map(cat => (
                <option key={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/50 pointer-events-none" />
          </div>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث عن منتج بالاسم أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-brand-200 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {storeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-brand-300 py-16 text-center">
          <div className="mb-4 rounded-full bg-brand-200 p-4 shadow-premium">
            <Package className="size-8 text-white/50" />
          </div>
          <h3 className="text-lg font-medium text-white">لا توجد منتجات</h3>
          <p className="mt-1 text-sm text-white/60 max-w-sm">
            هذا المتجر لا يحتوي على أي منتجات مضافة حالياً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {storeProducts.map((product, idx) => (
            <div key={product.sku} className="flex flex-col rounded-2xl border border-white/10 bg-brand-200 overflow-hidden shadow-premium hover:shadow-premium transition-shadow">
              <div className="flex h-48 items-center justify-center bg-brand-300">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="rounded-md border border-white/10 bg-brand-300 px-2 py-0.5 text-xs font-medium text-white/70">
                    {product.category}
                  </span>
                  <span className="text-xs font-mono text-white/50">{product.sku}</span>
                </div>
                
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <span className={`rounded-lg px-2 py-1 text-xs font-bold ${product.stock > 0 ? 'bg-slate-900 text-white' : 'bg-red-100 text-red-700'}`}>
                    {product.stock > 0 ? `${product.stock} متوفر` : 'نفد'}
                  </span>
                  <span className="text-2xl font-bold text-white" dir="ltr">
                    {product.price} <span className="text-sm font-medium">د.ل</span>
                  </span>
                </div>

                <div className="mt-4 border-t border-white/5 pt-4">
                  <button type="button" className="btn-action-solid w-full py-2.5 text-sm">
                    <Eye className="size-4" />
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-brand-200 p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-white/90">إضافة منتج جديد للمتجر</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-white/50 hover:text-white/70 transition-colors">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">اسم المنتج</label>
                <input type="text" className="w-full rounded-lg border border-white/20 px-4 py-2 outline-none focus:border-brand-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">الوصف</label>
                <textarea rows="3" className="w-full rounded-lg border border-white/20 px-4 py-2 outline-none focus:border-brand-500 bg-brand-300 transition-colors"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">السعر (د.ل)</label>
                  <input type="number" className="w-full rounded-lg border border-white/20 px-4 py-2 outline-none focus:border-brand-500 bg-brand-300 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">الكمية</label>
                  <input type="number" className="w-full rounded-lg border border-white/20 px-4 py-2 outline-none focus:border-brand-500 bg-brand-300 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">التصنيف</label>
                  <select className="w-full rounded-lg border border-white/20 px-4 py-2 outline-none focus:border-brand-500 bg-brand-300 text-white/70 transition-colors">
                    <option>اختر التصنيف</option>
                    {CLOTHING_CATEGORIES.map(cat => (
                      <option key={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8 pt-4 border-t">
                <button onClick={() => setShowAddProduct(false)} className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium hover:bg-brand-300 transition-colors">إلغاء</button>
                <button onClick={() => setShowAddProduct(false)} className="rounded-lg bg-brand-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-950 transition-colors shadow-premium">إضافة المنتج</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

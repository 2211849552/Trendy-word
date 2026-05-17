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
      <div className="flex flex-col items-start gap-4 border-b border-slate-200 pb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <ArrowRight className="size-4" />
          العودة للمتاجر
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">منتجات المتجر: {store?.name}</h1>
          <p className="text-sm text-slate-500">إدارة كتالوج المنتجات الخاص بهذا المتجر</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-blue-500">
              <option>الكل</option>
              <option>متوفر</option>
              <option>نفد</option>
            </select>
            <ChevronDown className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-blue-500">
              <option>جميع التصنيفات</option>
              {CLOTHING_CATEGORIES.map(cat => (
                <option key={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث عن منتج بالاسم أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      {storeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <Package className="size-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">لا توجد منتجات</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            هذا المتجر لا يحتوي على أي منتجات مضافة حالياً.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {storeProducts.map((product, idx) => (
            <div key={product.sku} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-48 items-center justify-center bg-slate-50">
                <img 
                  src={`https://images.unsplash.com/photo-${idx % 2 === 0 ? '1521572163474-6864f9cf17ab' : '1591047139829-d91aecb6caea'}?auto=format&fit=crop&w=400&q=80`} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {product.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{product.sku}</span>
                </div>
                
                <div className="mt-auto pt-6 flex items-center justify-between">
                  <span className={`rounded-lg px-2 py-1 text-xs font-bold ${product.stock > 0 ? 'bg-slate-900 text-white' : 'bg-red-100 text-red-700'}`}>
                    {product.stock > 0 ? `${product.stock} متوفر` : 'نفد'}
                  </span>
                  <span className="text-2xl font-bold text-blue-600" dir="ltr">
                    {product.price} <span className="text-sm font-medium">د.ل</span>
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <button className="w-full rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-blue-600 hover:bg-blue-100 flex justify-center items-center gap-2 transition-colors font-bold text-sm">
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">إضافة منتج جديد للمتجر</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم المنتج</label>
                <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                <textarea rows="3" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 bg-slate-50 transition-colors"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">السعر (د.ل)</label>
                  <input type="number" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 bg-slate-50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الكمية</label>
                  <input type="number" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 bg-slate-50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التصنيف</label>
                  <select className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 bg-slate-50 text-slate-600 transition-colors">
                    <option>اختر التصنيف</option>
                    {CLOTHING_CATEGORIES.map(cat => (
                      <option key={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8 pt-4 border-t">
                <button onClick={() => setShowAddProduct(false)} className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">إلغاء</button>
                <button onClick={() => setShowAddProduct(false)} className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">إضافة المنتج</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

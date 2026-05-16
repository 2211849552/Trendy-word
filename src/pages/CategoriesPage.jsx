import { useState } from 'react'
import { Plus, Search, Trash2, Edit, Eye, Archive, Tag, Package, CheckCircle } from 'lucide-react'
import { CLOTHING_CATEGORIES, CLOTHING_ATTRIBUTES } from '../data/catalogData.js'

export function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddAttribute, setShowAddAttribute] = useState(false)

  // Stats
  const totalCategories = CLOTHING_CATEGORIES.length
  const activeCategories = CLOTHING_CATEGORIES.filter(c => c.isActive).length
  const totalProducts = CLOTHING_CATEGORIES.reduce((acc, cat) => acc + cat.count, 0)
  const totalAttributes = CLOTHING_ATTRIBUTES.length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">إدارة الكتالوج</h1>
        <p className="text-sm text-slate-500">إدارة التصنيفات والخصائص العامة للمنتجات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Archive className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">التصنيفات الفرعية</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalCategories}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
            <Tag className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">خصائص المنتجات</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalAttributes}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Package className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">إجمالي المنتجات</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalProducts}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">التصنيفات النشطة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{activeCategories}</p>
        </div>
      </div>

      {/* Tabs Area */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            التصنيفات ({totalCategories})
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
              activeTab === 'attributes'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            الخصائص ({totalAttributes})
          </button>
        </div>

        <div className="p-5">
          {activeTab === 'categories' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="size-4" />
                  إضافة تصنيف
                </button>
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="البحث عن تصنيف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {CLOTHING_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="text-5xl mb-4">{cat.icon}</div>
                    <h3 className="text-base font-bold text-slate-800">{cat.name}</h3>
                    {cat.isActive && (
                      <span className="mt-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-700">
                        نشط
                      </span>
                    )}
                    <p className="mt-4 text-xl font-bold text-blue-600">{cat.count}</p>
                    <p className="text-xs text-slate-400 mt-1">منتج</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAddAttribute(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="size-4" />
                  إضافة خاصية
                </button>
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="البحث عن خاصية..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">اسم الخاصية</th>
                      <th className="px-4 py-3 font-medium">النوع</th>
                      <th className="px-4 py-3 font-medium">مطلوبة</th>
                      <th className="px-4 py-3 font-medium">التصنيفات</th>
                      <th className="px-4 py-3 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {CLOTHING_ATTRIBUTES.map((attr) => (
                      <tr key={attr.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{attr.name}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {attr.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {attr.isRequired ? (
                            <span className="text-red-600 font-medium">✓ نعم</span>
                          ) : (
                            <span className="text-slate-400">لا</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {attr.categories.slice(0, 2).map((cat) => (
                              <span key={cat} className="rounded bg-fuchsia-50 px-2 py-1 text-xs text-fuchsia-700">
                                {cat}
                              </span>
                            ))}
                            {attr.categories.length > 2 && (
                              <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                +{attr.categories.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800"><Eye className="size-4" /></button>
                            <button className="text-emerald-600 hover:text-emerald-800"><Edit className="size-4" /></button>
                            <button className="text-red-600 hover:text-red-800"><Trash2 className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal (Simplified) */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">إضافة تصنيف جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم التصنيف *</label>
                <input type="text" placeholder="مثال: قميص رجالي" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الأيقونة</label>
                <div className="flex gap-2 text-2xl p-3 border rounded-lg overflow-x-auto bg-slate-50">
                  <button className="hover:scale-110 transition-transform">👔</button>
                  <button className="hover:scale-110 transition-transform">👖</button>
                  <button className="hover:scale-110 transition-transform">👗</button>
                  <button className="hover:scale-110 transition-transform">🧥</button>
                  <button className="hover:scale-110 transition-transform">👚</button>
                  <button className="hover:scale-110 transition-transform">🩳</button>
                  <button className="hover:scale-110 transition-transform border-r pl-2 pr-2 ml-2 border-slate-300">📦</button>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8 pt-4 border-t">
                <button onClick={() => setShowAddCategory(false)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50">إلغاء</button>
                <button onClick={() => setShowAddCategory(false)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">إضافة التصنيف</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Attribute Modal (Simplified) */}
      {showAddAttribute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">إضافة خاصية جديدة</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">اسم الخاصية *</label>
                <input type="text" placeholder="مثال: المقاس" className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">نوع الخاصية *</label>
                <select className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 bg-white">
                  <option>نص</option>
                  <option>قائمة</option>
                  <option>رقم</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="req" className="size-4 rounded border-slate-300 text-blue-600" />
                <label htmlFor="req" className="text-sm font-medium text-slate-700">خاصية مطلوبة</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">التصنيفات المرتبطة *</label>
                <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto bg-slate-50">
                  {CLOTHING_CATEGORIES.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 hover:bg-slate-100 rounded">
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <input type="checkbox" className="size-4 rounded border-slate-300 text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8 pt-4 border-t">
                <button onClick={() => setShowAddAttribute(false)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50">إلغاء</button>
                <button onClick={() => setShowAddAttribute(false)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">إضافة الخاصية</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

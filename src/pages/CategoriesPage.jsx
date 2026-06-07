import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit, Eye, Archive, Tag, Package, CheckCircle, X, Check, ChevronDown } from 'lucide-react'
import { DEFAULT_CATEGORY_IMAGE } from '../data/catalogData.js'
import {
  searchCatalogCategories,
  searchCatalogAttributes,
  extractCatalogList,
  mapCategory,
  mapAttribute,
} from '../api/catalog.js'
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../api/adminCategories.js'
import {
  getAdminAttributes,
  createAdminAttribute,
  getAdminAttribute,
  updateAdminAttribute,
  deleteAdminAttribute,
} from '../api/adminAttributes.js'
import { CategoryImage } from '../components/catalog/CategoryImage.jsx'
import { CategoryImagePicker } from '../components/catalog/CategoryImagePicker.jsx'

// Mock data for demo mode (fallback when backend is unavailable)
const MOCK_CATEGORIES = [
  { id: 1, name: 'أزياء رجالية', image: DEFAULT_CATEGORY_IMAGE, count: 24, isActive: true },
  { id: 2, name: 'أزياء نسائية', image: DEFAULT_CATEGORY_IMAGE, count: 36, isActive: true },
  { id: 3, name: 'إلكترونيات', image: DEFAULT_CATEGORY_IMAGE, count: 12, isActive: true },
  { id: 4, name: 'أحذية', image: DEFAULT_CATEGORY_IMAGE, count: 18, isActive: true },
  { id: 5, name: 'ساعات', image: DEFAULT_CATEGORY_IMAGE, count: 8, isActive: false },
]

const MOCK_ATTRIBUTES = [
  { id: 1, name: 'المقاس', type: 'قائمة', isRequired: true, options: ['S', 'M', 'L', 'XL', 'XXL'], relatedCats: ['أزياء رجالية', 'أزياء نسائية'] },
  { id: 2, name: 'اللون', type: 'قائمة', isRequired: true, options: ['أحمر', 'أزرق', 'أسود', 'أبيض'], relatedCats: ['أزياء رجالية', 'أزياء نسائية', 'أحذية'] },
  { id: 3, name: 'المادة', type: 'نص', isRequired: false, options: [], relatedCats: ['ساعات'] },
]

export function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddAttribute, setShowAddAttribute] = useState(false)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [showEditAttribute, setShowEditAttribute] = useState(false)
  const [showAttrDetails, setShowAttrDetails] = useState(false)
  
  const [categories, setCategories] = useState([])
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isMockMode, setIsMockMode] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Edit/View target states
  const [selectedItem, setSelectedItem] = useState(null)

  // Form states for adding/editing
  const [newCatName, setNewCatName] = useState('')
  const [newCatImage, setNewCatImage] = useState(DEFAULT_CATEGORY_IMAGE)
  const [newAttrName, setNewAttrName] = useState('')
  const [attrOptions, setAttrOptions] = useState([])

  useEffect(() => {
    const q = searchQuery.trim()
    const timer = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        if (activeTab === 'categories') {
          const data = q
            ? await searchCatalogCategories({ query: q })
            : await getAdminCategories()
          setCategories(extractCatalogList(data).map((item) => mapCategory(item, DEFAULT_CATEGORY_IMAGE)))
        } else {
          const data = q
            ? await searchCatalogAttributes({ query: q })
            : await getAdminAttributes()
          setAttributes(extractCatalogList(data).map(mapAttribute))
        }
      } catch {
        setIsMockMode(true)
        if (activeTab === 'categories') {
          setCategories(MOCK_CATEGORIES)
        } else {
          setAttributes(MOCK_ATTRIBUTES)
        }
        setLoadError('')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, activeTab])

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return

    if (isMockMode) {
      const created = {
        id: Date.now(),
        name: newCatName.trim(),
        image: newCatImage,
        count: 0,
        isActive: true,
      }
      setCategories((prev) => [created, ...prev])
      setNewCatName('')
      setShowAddCategory(false)
      triggerToast('تم إضافة التصنيف بنجاح')
      return
    }

    try {
      const data = await createAdminCategory({
        name: newCatName.trim(),
      })
      const created = mapCategory(data?.data ?? data, DEFAULT_CATEGORY_IMAGE)
      setCategories((prev) => [created, ...prev])
      setNewCatName('')
      setShowAddCategory(false)
      triggerToast('تم إضافة التصنيف بنجاح')
    } catch {
      triggerToast('تعذّر إضافة التصنيف. حاول مرة أخرى.')
    }
  }

  const handleEditCategory = async () => {
    if (!newCatName.trim() || !selectedItem) return

    if (isMockMode) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedItem.id
            ? { ...c, name: newCatName.trim(), image: newCatImage }
            : c,
        ),
      )
      setShowEditCategory(false)
      triggerToast('تم تحديث التصنيف بنجاح')
      return
    }

    try {
      const data = await updateAdminCategory(selectedItem.id, {
        name: newCatName.trim(),
        image: newCatImage,
        image_url: newCatImage,
      })
      const updated = mapCategory(data?.data ?? data, DEFAULT_CATEGORY_IMAGE)
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedItem.id ? { ...c, ...updated } : c)),
      )
      setShowEditCategory(false)
      triggerToast('تم تحديث التصنيف بنجاح')
    } catch {
      triggerToast('تعذّر تحديث التصنيف. حاول مرة أخرى.')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (isMockMode) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      triggerToast('تم حذف التصنيف بنجاح')
      return
    }

    try {
      await deleteAdminCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      triggerToast('تم حذف التصنيف بنجاح')
    } catch {
      triggerToast('تعذّر حذف التصنيف. حاول مرة أخرى.')
    }
  }

  const handleAddAttribute = async () => {
    if (!newAttrName.trim()) return

    if (isMockMode) {
      const created = {
        id: Date.now(),
        name: newAttrName.trim(),
        type: 'قائمة',
        isRequired: true,
        options: ['S', 'M', 'L', 'XL', 'XXL'],
        relatedCats: [],
      }
      setAttributes((prev) => [created, ...prev])
      setNewAttrName('')
      setShowAddAttribute(false)
      triggerToast('تم إضافة الخاصية بنجاح')
      return
    }

    try {
      const data = await createAdminAttribute({
        name: newAttrName.trim(),
        type: 'list',
        is_required: true,
        options: ['S', 'M', 'L', 'XL', 'XXL'],
      })
      const created = mapAttribute(data?.data ?? data)
      setAttributes((prev) => [created, ...prev])
      setNewAttrName('')
      setShowAddAttribute(false)
      triggerToast('تم إضافة الخاصية بنجاح')
    } catch {
      triggerToast('تعذّر إضافة الخاصية. حاول مرة أخرى.')
    }
  }

  const handleEditAttribute = async () => {
    if (!newAttrName.trim() || !selectedItem) return

    if (isMockMode) {
      setAttributes((prev) =>
        prev.map((a) =>
          a.id === selectedItem.id
            ? { ...a, name: newAttrName.trim(), options: attrOptions }
            : a,
        ),
      )
      setShowEditAttribute(false)
      triggerToast('تم تحديث الخاصية بنجاح')
      return
    }

    try {
      const data = await updateAdminAttribute(selectedItem.id, {
        name: newAttrName.trim(),
        options: attrOptions,
        list_options: attrOptions,
      })
      const updated = mapAttribute(data?.data ?? data)
      setAttributes((prev) =>
        prev.map((a) => (a.id === selectedItem.id ? { ...a, ...updated, options: attrOptions } : a)),
      )
      setShowEditAttribute(false)
      triggerToast('تم تحديث الخاصية بنجاح')
    } catch {
      triggerToast('تعذّر تحديث الخاصية. حاول مرة أخرى.')
    }
  }

  const handleDeleteAttribute = async (id) => {
    if (isMockMode) {
      setAttributes((prev) => prev.filter((a) => a.id !== id))
      triggerToast('تم حذف الخاصية بنجاح')
      return
    }

    try {
      await deleteAdminAttribute(id)
      setAttributes((prev) => prev.filter((a) => a.id !== id))
      triggerToast('تم حذف الخاصية بنجاح')
    } catch {
      triggerToast('تعذّر حذف الخاصية. حاول مرة أخرى.')
    }
  }

  const openEditCategory = (cat) => {
    setSelectedItem(cat)
    setNewCatName(cat.name)
    setNewCatImage(cat.image || DEFAULT_CATEGORY_IMAGE)
    setShowEditCategory(true)
  }

  const openAttrDetails = async (attr) => {
    setSelectedItem(attr)
    setShowAttrDetails(true)

    try {
      const data = await getAdminAttribute(attr.id)
      setSelectedItem(mapAttribute(data?.data ?? data))
    } catch {
      // keep list item data if detail fetch fails
    }
  }

  const openEditAttr = (attr) => {
    setSelectedItem(attr)
    setNewAttrName(attr.name)
    setAttrOptions(attr.options || ['S', 'M', 'L', 'XL', 'XXL'])
    setShowEditAttribute(true)
  }

  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const totalProducts = categories.reduce((acc, cat) => acc + cat.count, 0)
  const totalAttributes = attributes.length

  return (
    <div className="mx-auto max-w-6xl space-y-6 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle className="size-5" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start gap-2 border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white">إدارة الكتالوج</h1>
        <p className="text-sm text-white/60">إدارة التصنيفات والخصائص العامة للمنتجات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-white/90">
            <Archive className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">التصنيفات الفرعية</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalCategories}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
            <Tag className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">خصائص المنتجات</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalAttributes}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Package className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي المنتجات</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalProducts}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-white">
            <CheckCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">التصنيفات النشطة</p>
          <p className="mt-1 text-2xl font-bold text-white">{activeCategories}</p>
        </div>
      </div>

      {/* Tabs Area */}
      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
              activeTab === 'categories'
                ? 'border-b-2 border-brand-900 text-white bg-brand-100/50'
                : 'text-white/60 hover:bg-brand-300 hover:text-white/80'
            }`}
          >
            التصنيفات ({totalCategories})
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
              activeTab === 'attributes'
                ? 'border-b-2 border-brand-900 text-white bg-brand-100/50'
                : 'text-white/60 hover:bg-brand-300 hover:text-white/80'
            }`}
          >
            الخصائص ({totalAttributes})
          </button>
        </div>

        <div className="p-5">
          {loadError ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-300">
              {loadError}
            </p>
          ) : null}

          {activeTab === 'categories' ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex items-center gap-2 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-950 transition-colors"
                >
                  <Plus className="size-4" />
                  إضافة تصنيف
                </button>
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    placeholder="البحث عن تصنيف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-brand-300 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-brand-200 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {loading ? (
                  <p className="col-span-full py-12 text-center text-sm text-white/55">جاري تحميل التصنيفات...</p>
                ) : categories.length === 0 ? (
                  <p className="col-span-full py-12 text-center text-sm text-white/55">
                    لا توجد تصنيفات. أضيفي تصنيفاً جديداً من الزر أعلاه.
                  </p>
                ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="group relative flex flex-col items-center rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium hover:border-brand-300 transition-all hover:shadow-premium text-center">
                    <CategoryImage
                      src={cat.image}
                      name={cat.name}
                      className="mb-4 aspect-square w-full max-w-[120px] rounded-xl shadow-premium ring-1 ring-slate-100 transition-transform group-hover:scale-[1.03]"
                    />
                    <h3 className="text-base font-bold text-white/90">{cat.name}</h3>
                    {cat.isActive && (
                      <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-bold text-emerald-700">
                        نشط
                      </span>
                    )}
                    <p className="mt-3 text-lg font-bold text-white">{cat.count} <span className="text-[10px] text-white/50 font-normal">منتج</span></p>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-50 pt-4 w-full">
                      <button 
                        onClick={() => openEditCategory(cat)}
                        className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-brand-100 text-white hover:bg-brand-900 hover:text-white transition-all text-[10px] font-bold"
                      >
                        <Edit className="size-3" />
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold"
                      >
                        <Trash2 className="size-3" />
                        حذف
                      </button>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAddAttribute(true)}
                  className="flex items-center gap-2 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-950 transition-colors"
                >
                  <Plus className="size-4" />
                  إضافة خاصية
                </button>
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                  <input
                    type="text"
                    placeholder="البحث عن خاصية..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-brand-300 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:border-brand-500 focus:bg-brand-200 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-brand-300 text-white/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">اسم الخاصية</th>
                      <th className="px-4 py-3 font-medium">النوع</th>
                      <th className="px-4 py-3 font-medium">مطلوبة</th>
                      <th className="px-4 py-3 font-medium text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-sm text-white/55">
                          جاري تحميل الخصائص...
                        </td>
                      </tr>
                    ) : attributes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-sm text-white/55">
                          لا توجد خصائص. أضيفي خاصية جديدة من الزر أعلاه.
                        </td>
                      </tr>
                    ) : (
                    attributes.map((attr) => (
                      <tr key={attr.id} className="hover:bg-brand-300">
                        <td className="px-4 py-4 font-bold text-white text-lg">{attr.name}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-brand-300 px-3 py-1 text-xs font-bold text-brand-700">
                            {attr.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {attr.isRequired ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle className="size-4" />
                              نعم
                            </span>
                          ) : (
                            <span className="text-white/50">لا</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-1.5">
                            <button 
                              onClick={() => openAttrDetails(attr)}
                              className="icon-btn-view" 
                              title="عرض التفاصيل"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button 
                              onClick={() => openEditAttr(attr)}
                              className="icon-btn-edit" 
                              title="تعديل"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAttribute(attr.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" 
                              title="حذف"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal (Matching Image 1) */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-brand-300/50">
               <h2 className="text-xl font-bold text-white/90">إضافة تصنيف جديد</h2>
               <button onClick={() => setShowAddCategory(false)} className="text-white/50 hover:text-white/70 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3 text-right">اسم التصنيف *</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="مثال: أزياء رجالية"
                  className="w-full rounded-xl border border-white/10 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" 
                />
              </div>
            </div>
            <div className="flex gap-3 justify-start p-6 bg-brand-300 border-t border-white/5">
                <button onClick={handleAddCategory} className="rounded-xl bg-brand-900 px-8 py-3 text-sm font-bold text-white hover:bg-brand-950 shadow-premium shadow-brand-900/15 transition-all active:scale-95">إضافة التصنيف</button>
                <button onClick={() => setShowAddCategory(false)} className="rounded-xl border border-white/10 bg-brand-200 px-8 py-3 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Property Modal (Matching Image 2/3/4) */}
      {showAddAttribute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto py-10">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
               <h2 className="text-xl font-bold text-white/90">إضافة خاصية جديدة</h2>
               <button onClick={() => setShowAddAttribute(false)} className="text-white/50 hover:text-white/70 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-white/60 mb-2 text-right">اسم الخاصية *</label>
                <input 
                  type="text" 
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  placeholder="مثال: المقاس"
                  className="w-full rounded-xl border border-white/10 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 mb-2 text-right">نوع الخاصية *</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-white/10 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium bg-brand-200">
                    <option>نص</option>
                    <option>قائمة اختيارات</option>
                    <option>رقم</option>
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-start gap-3 py-4 border-y border-slate-50">
                <input type="checkbox" id="req_add" defaultChecked className="size-5 rounded border-white/20 text-white" />
                <label htmlFor="req_add" className="text-sm font-bold text-white/80">خاصية مطلوبة</label>
              </div>

              <div>
                <p className="text-xs font-bold text-white/60 mb-4 text-right">التصنيفات المرتبطة *</p>
                <div className="rounded-2xl border border-white/5 bg-brand-300/50 p-4 space-y-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <CategoryImage
                            src={cat.image}
                            name={cat.name}
                            className="size-8 shrink-0 rounded-lg"
                          />
                          <span className="text-sm font-bold text-white/90">{cat.name}</span>
                       </div>
                       <input type="checkbox" className="size-5 rounded border-white/20 text-white" />
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-white/50 text-left">تم تحديد 0 تصنيف</p>
              </div>
            </div>
            <div className="flex gap-3 justify-start p-6 bg-brand-300 border-t border-white/5">
                <button onClick={handleAddAttribute} className="rounded-xl bg-brand-900 px-8 py-3 text-sm font-bold text-white hover:bg-brand-950 shadow-premium shadow-brand-900/15 transition-all active:scale-95">إضافة الخاصية</button>
                <button onClick={() => setShowAddAttribute(false)} className="rounded-xl border border-white/10 bg-brand-200 px-8 py-3 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal (Matching Image 1) */}
      {showEditCategory && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-brand-300/50">
               <h2 className="text-xl font-bold text-white/90">تعديل التصنيف</h2>
               <button onClick={() => setShowEditCategory(false)} className="text-white/50 hover:text-white/70 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3 text-right">اسم التصنيف</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/80 mb-3 text-right">صورة التصنيف</label>
                <CategoryImagePicker value={newCatImage} onChange={setNewCatImage} />
              </div>
            </div>
            <div className="flex gap-3 justify-start p-6 bg-brand-300 border-t border-white/5">
                <button onClick={handleEditCategory} className="rounded-xl bg-brand-900 px-8 py-3 text-sm font-bold text-white hover:bg-brand-950 shadow-premium shadow-brand-900/15 transition-all active:scale-95">حفظ التعديلات</button>
                <button onClick={() => setShowEditCategory(false)} className="rounded-xl border border-white/10 bg-brand-200 px-8 py-3 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal (Matching Image 2) */}
      {showAttrDetails && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
               <h2 className="text-xl font-bold text-white/90">تفاصيل الخاصية</h2>
               <button onClick={() => setShowAttrDetails(false)} className="text-white/50 hover:text-white/70 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8 space-y-8">
               <div className="border-b border-white/5 pb-4">
                  <h3 className="text-2xl font-bold text-white">{selectedItem.name}</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-brand-300 p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-white/50 mb-2 uppercase tracking-wider">النوع</span>
                    <span className="rounded-full bg-brand-300 px-4 py-1.5 text-xs font-bold text-brand-700">
                      {selectedItem.type}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-brand-300 p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-white/50 mb-2 uppercase tracking-wider">مطلوبة</span>
                    <span className="text-red-500 font-bold flex items-center gap-1 text-sm">
                      <Check className="size-4" />
                      {selectedItem.isRequired ? 'نعم' : 'لا'}
                    </span>
                  </div>
               </div>

               <div className="rounded-2xl bg-brand-100/30 p-5 border border-brand-100/50">
                  <p className="text-[10px] font-bold text-white/50 mb-4 uppercase tracking-wider">الخيارات المتاحة ({selectedItem.options?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                     {(selectedItem.options || ['S', 'M', 'L', 'XL', 'XXL']).map(opt => (
                       <span key={opt} className="rounded-lg bg-brand-200 border border-white/10 px-4 py-1.5 text-xs font-bold text-white/80 shadow-premium">
                         {opt}
                       </span>
                     ))}
                  </div>
               </div>

               <div className="rounded-2xl bg-fuchsia-50/30 p-5 border border-fuchsia-100/50">
                  <p className="text-[10px] font-bold text-white/50 mb-4 uppercase tracking-wider">التصنيفات المرتبطة ({selectedItem.relatedCats?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                     {(selectedItem.relatedCats || ['أزياء رجالية', 'أزياء نسائية']).map(cat => (
                       <span key={cat} className="rounded-lg bg-fuchsia-100 px-4 py-1.5 text-xs font-bold text-fuchsia-700">
                         {cat}
                       </span>
                     ))}
                  </div>
               </div>
            </div>
            <div className="p-6 bg-brand-300 border-t border-white/5 flex justify-end">
               <button onClick={() => setShowAttrDetails(false)} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                  إغلاق
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal (Matching Image 3 & 4) */}
      {showEditAttribute && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto py-10">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
               <h2 className="text-xl font-bold text-white/90">تعديل الخاصية</h2>
               <button onClick={() => setShowEditAttribute(false)} className="text-white/50 hover:text-white/70 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-white/60 mb-2 text-left">اسم الخاصية</label>
                <input 
                  type="text" 
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 mb-2 text-left">نوع الخاصية</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-white/10 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium bg-brand-200">
                    <option>قائمة اختيارات</option>
                    <option>نص حر</option>
                    <option>رقم</option>
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 mb-3 text-left">الخيارات</label>
                <div className="space-y-2">
                  {attrOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-1 duration-200">
                      <button 
                        onClick={() => setAttrOptions(attrOptions.filter((_, i) => i !== idx))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...attrOptions]
                          newOpts[idx] = e.target.value
                          setAttrOptions(newOpts)
                        }}
                        className="flex-1 rounded-xl border border-white/10 px-5 py-2.5 text-right outline-none focus:border-brand-500 transition-all text-sm font-medium" 
                      />
                    </div>
                  ))}
                  <button 
                    onClick={() => setAttrOptions([...attrOptions, ''])}
                    className="flex items-center gap-1 text-white font-bold text-sm hover:underline mt-2 mr-auto"
                  >
                    <Plus className="size-4" />
                    إضافة خيار
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 py-4 border-y border-slate-50">
                <label htmlFor="req_edit" className="text-sm font-bold text-white/80">خاصية مطلوبة</label>
                <input type="checkbox" id="req_edit" defaultChecked className="size-5 rounded border-white/20 text-white" />
              </div>

              <div>
                <p className="text-xs font-bold text-white/60 mb-4 text-left">التصنيفات المرتبطة</p>
                <div className="rounded-2xl border border-white/5 bg-brand-300/50 p-4 space-y-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between">
                       <input type="checkbox" defaultChecked={cat.name.includes('أزياء')} className="size-5 rounded border-white/20 text-white" />
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white/90">{cat.name}</span>
                          <CategoryImage
                            src={cat.image}
                            name={cat.name}
                            className="size-8 shrink-0 rounded-lg"
                          />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-start p-6 bg-brand-300 border-t border-white/5">
                <button onClick={handleEditAttribute} className="rounded-xl bg-brand-900 px-8 py-3 text-sm font-bold text-white hover:bg-brand-950 shadow-premium shadow-brand-900/15 transition-all active:scale-95">حفظ التعديلات</button>
                <button onClick={() => setShowEditAttribute(false)} className="rounded-xl border border-white/10 bg-brand-200 px-8 py-3 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

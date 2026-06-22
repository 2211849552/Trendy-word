import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Eye, Archive, Tag, Package, CheckCircle, X, Check, Pencil } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
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
export function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddAttribute, setShowAddAttribute] = useState(false)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [showEditAttribute, setShowEditAttribute] = useState(false)
  const [showCatDetails, setShowCatDetails] = useState(false)
  const [showAttrDetails, setShowAttrDetails] = useState(false)
  
  const [categories, setCategories] = useState([])
  const [attributes, setAttributes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Edit/View target states
  const [selectedItem, setSelectedItem] = useState(null)

  // Form states for adding/editing
  const [newCatName, setNewCatName] = useState('')
  const [newAttrName, setNewAttrName] = useState('')
  const [attrOptions, setAttrOptions] = useState([])
  const [editAttrOriginalOptions, setEditAttrOriginalOptions] = useState([])

  const patchCategoryInList = (id, patch) => {
    setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    setSelectedItem((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  const patchAttributeInList = (id, patch) => {
    setAttributes((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
    setSelectedItem((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  const loadCatalogData = async (tab = activeTab, query = searchQuery.trim()) => {
    if (tab === 'categories') {
      const data = query
        ? await searchCatalogCategories({ query })
        : await getAdminCategories()
      setCategories(extractCatalogList(data).map((item) => mapCategory(item)))
      return
    }

    const data = query
      ? await searchCatalogAttributes({ query })
      : await getAdminAttributes()
    setAttributes(extractCatalogList(data).map(mapAttribute))
  }

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadCatalogData(activeTab, searchQuery.trim())
        setLoadError('')
      } catch (err) {
        if (activeTab === 'categories') {
          setCategories([])
        } else {
          setAttributes([])
        }
        const status = err?.status
        if (status === 401) {
          setLoadError('انتهت الجلسة. سجّلي الدخول من جديد.')
        } else {
          setLoadError('تعذّر تحميل البيانات. تأكد من تسجيل الدخول وأن الخادم يعمل.')
        }
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

  const apiErrorMessage = (err, fallback) => {
    if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
    if (err?.status === 422) return err.message || fallback
    if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
    return err?.message || fallback
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return

    try {
      await createAdminCategory({ name: newCatName.trim() })
      await loadCatalogData('categories')
      setNewCatName('')
      setShowAddCategory(false)
      triggerToast('تم إضافة التصنيف بنجاح')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر إضافة التصنيف. حاول مرة أخرى.'))
    }
  }

  const handleEditCategory = async () => {
    if (!newCatName.trim() || !selectedItem) return

    try {
      const response = await updateAdminCategory(selectedItem.id, { name: newCatName.trim() })
      const updated = mapCategory(response?.data ?? response)
      patchCategoryInList(selectedItem.id, { ...updated, name: newCatName.trim() })
      setShowEditCategory(false)
      triggerToast('تم تحديث التصنيف بنجاح')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحديث التصنيف. حاول مرة أخرى.'))
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      await deleteAdminCategory(id)
      await loadCatalogData('categories')
      triggerToast('تم حذف التصنيف بنجاح')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر حذف التصنيف. حاول مرة أخرى.'))
    }
  }

  const openAddAttributeModal = () => {
    setNewAttrName('')
    setAttrOptions([''])
    setShowAddAttribute(true)
  }

  const handleAddAttribute = async () => {
    const trimmedName = newAttrName.trim()
    const values = attrOptions.map((value) => value.trim()).filter(Boolean)

    if (!trimmedName) {
      triggerToast('يرجى إدخال اسم الخاصية.')
      return
    }
    if (values.length === 0) {
      triggerToast('يرجى إدخال قيمة واحدة على الأقل.')
      return
    }

    try {
      await createAdminAttribute({
        name: trimmedName,
        type: 'list',
        is_required: true,
        values,
      })
      await loadCatalogData('attributes')
      setNewAttrName('')
      setAttrOptions([])
      setShowAddAttribute(false)
      triggerToast('تم إضافة الخاصية بنجاح')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر إضافة الخاصية. حاول مرة أخرى.'))
    }
  }

  const handleEditAttribute = async () => {
    const trimmedName = newAttrName.trim()
    const values = attrOptions.map((value) => value.trim()).filter(Boolean)

    if (!trimmedName || !selectedItem) {
      triggerToast('يرجى إدخال اسم الخاصية.')
      return
    }
    if (values.length === 0) {
      triggerToast('يرجى إدخال قيمة واحدة على الأقل.')
      return
    }

    const newValuesOnly = values.filter((value) => !editAttrOriginalOptions.includes(value))
    const payload = { name: trimmedName }
    if (newValuesOnly.length > 0) {
      payload.values = newValuesOnly
    }

    try {
      const response = await updateAdminAttribute(selectedItem.id, payload)
      const fromApi = mapAttribute(response?.data ?? response)
      patchAttributeInList(selectedItem.id, {
        ...fromApi,
        name: trimmedName,
        options: values,
      })
      setShowEditAttribute(false)
      triggerToast('تم تحديث الخاصية بنجاح')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحديث الخاصية. حاول مرة أخرى.'))
    }
  }

  const handleDeleteAttribute = async (id) => {
    try {
      await deleteAdminAttribute(id)
      await loadCatalogData('attributes')
      triggerToast('تم حذف الخاصية بنجاح')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر حذف الخاصية. حاول مرة أخرى.'))
    }
  }

  const openEditCategory = (cat) => {
    setSelectedItem(cat)
    setNewCatName(cat.name)
    setShowEditCategory(true)
  }

  const openCatDetails = (cat) => {
    setSelectedItem(cat)
    setShowCatDetails(true)
  }

  const openEditCategoryFromDetails = () => {
    if (!selectedItem) return
    setShowCatDetails(false)
    setNewCatName(selectedItem.name)
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
    const options = attr.options?.length ? [...attr.options] : ['']
    setSelectedItem(attr)
    setNewAttrName(attr.name)
    setAttrOptions(options)
    setEditAttrOriginalOptions(attr.options?.length ? [...attr.options] : [])
    setShowEditAttribute(true)
  }

  const openEditAttrFromDetails = async () => {
    if (!selectedItem) return
    setShowAttrDetails(false)

    let attr = selectedItem
    try {
      const data = await getAdminAttribute(selectedItem.id)
      attr = mapAttribute(data?.data ?? data)
    } catch {
      // keep list item data if detail fetch fails
    }

    const options = attr.options?.length ? [...attr.options] : ['']
    setSelectedItem(attr)
    setNewAttrName(attr.name)
    setAttrOptions(options)
    setEditAttrOriginalOptions(attr.options?.length ? [...attr.options] : [])
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
          <p className="text-sm font-medium text-white/60">تصنيفات المنتجات</p>
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
                <PrimaryButton onClick={() => setShowAddCategory(true)} className="shrink-0">
                  <Plus className="size-5" strokeWidth={2.5} aria-hidden />
                  إضافة تصنيف
                </PrimaryButton>
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

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-brand-300 text-white/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">اسم التصنيف</th>
                      <th className="px-4 py-3 font-medium">عدد المنتجات</th>
                      <th className="px-4 py-3 font-medium text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center text-sm text-white/55">
                          جاري تحميل التصنيفات...
                        </td>
                      </tr>
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center text-sm text-white/55">
                          لا توجد تصنيفات. أضيفي تصنيفاً جديداً من الزر أعلاه.
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-brand-300">
                          <td className="px-4 py-4 font-bold text-white">{cat.name}</td>
                          <td className="px-4 py-4 text-white">
                            {cat.count} <span className="text-white/50">منتج</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => openCatDetails(cat)}
                                className="icon-btn-view"
                                title="عرض التفاصيل"
                              >
                                <Eye className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
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
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-4">
                <PrimaryButton onClick={openAddAttributeModal} className="shrink-0">
                  <Plus className="size-5" strokeWidth={2.5} aria-hidden />
                  إضافة خاصية
                </PrimaryButton>
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
                      <th className="px-4 py-3 font-medium">قيم الخاصية</th>
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
                          {attr.options?.length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {attr.options.map((opt) => (
                                <span
                                  key={opt}
                                  className="rounded-lg border border-white/10 bg-brand-300 px-2.5 py-1 text-xs font-bold text-white/80"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-white/50">—</span>
                          )}
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
                <PrimaryButton onClick={handleAddCategory} className="px-8 py-3">إضافة التصنيف</PrimaryButton>
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
                <label className="block text-xs font-bold text-white/60 mb-3 text-right">قيم الخاصية *</label>
                <div className="space-y-2">
                  {attrOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-1 duration-200">
                      <button
                        type="button"
                        onClick={() => setAttrOptions(attrOptions.filter((_, i) => i !== idx))}
                        disabled={attrOptions.length === 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                        placeholder={`القيمة ${idx + 1}`}
                        className="flex-1 rounded-xl border border-white/10 px-5 py-2.5 text-right outline-none focus:border-brand-500 transition-all text-sm font-medium"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAttrOptions([...attrOptions, ''])}
                    className="flex items-center gap-1 text-white font-bold text-sm hover:underline mt-2 mr-auto"
                  >
                    <Plus className="size-4" />
                    إضافة قيمة
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-start p-6 bg-brand-300 border-t border-white/5">
                <PrimaryButton onClick={handleAddAttribute} className="px-8 py-3">إضافة الخاصية</PrimaryButton>
                <button onClick={() => setShowAddAttribute(false)} className="rounded-xl border border-white/10 bg-brand-200 px-8 py-3 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Details Modal */}
      {showCatDetails && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-brand-300/50">
              <h2 className="text-xl font-bold text-white/90">تفاصيل التصنيف</h2>
              <button onClick={() => setShowCatDetails(false)} className="text-white/50 hover:text-white/70 transition-colors">
                <X className="size-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-2xl font-bold text-white">{selectedItem.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-brand-300 p-4 border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-white/50 mb-2 uppercase tracking-wider">عدد المنتجات</span>
                  <span className="text-xl font-bold text-white tabular-nums">{selectedItem.count}</span>
                </div>
                <div className="rounded-2xl bg-brand-300 p-4 border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-white/50 mb-2 uppercase tracking-wider">الحالة</span>
                  <span className={`text-sm font-bold ${selectedItem.isActive ? 'text-emerald-400' : 'text-white/50'}`}>
                    {selectedItem.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-white/5 bg-brand-300 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCatDetails(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-brand-200 px-6 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={openEditCategoryFromDetails}
                className="btn-primary inline-flex min-h-10 items-center justify-center gap-2 px-6 text-sm font-bold"
              >
                <Pencil className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                تعديل
              </button>
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
            <div className="flex flex-col-reverse gap-2 border-t border-white/5 bg-brand-300 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowAttrDetails(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 bg-brand-200 px-6 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={openEditAttrFromDetails}
                className="btn-primary inline-flex min-h-10 items-center justify-center gap-2 px-6 text-sm font-bold"
              >
                <Pencil className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                تعديل
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
                <label className="block text-xs font-bold text-white/60 mb-2 text-right">اسم الخاصية *</label>
                <input
                  type="text"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 mb-3 text-right">قيم الخاصية *</label>
                <div className="space-y-2">
                  {attrOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-1 duration-200">
                      <button
                        type="button"
                        onClick={() => setAttrOptions(attrOptions.filter((_, i) => i !== idx))}
                        disabled={attrOptions.length === 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                        placeholder={`القيمة ${idx + 1}`}
                        className="flex-1 rounded-xl border border-white/10 px-5 py-2.5 text-right outline-none focus:border-brand-500 transition-all text-sm font-medium"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAttrOptions([...attrOptions, ''])}
                    className="flex items-center gap-1 text-white font-bold text-sm hover:underline mt-2 mr-auto"
                  >
                    <Plus className="size-4" />
                    إضافة قيمة
                  </button>
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

import { useState } from 'react'
import { Plus, Search, Trash2, Edit, Eye, Archive, Tag, Package, CheckCircle, X, Check, ChevronDown } from 'lucide-react'
import { CLOTHING_CATEGORIES, CLOTHING_ATTRIBUTES } from '../data/catalogData.js'

export function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddAttribute, setShowAddAttribute] = useState(false)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [showEditAttribute, setShowEditAttribute] = useState(false)
  const [showAttrDetails, setShowAttrDetails] = useState(false)
  
  const [categories, setCategories] = useState(CLOTHING_CATEGORIES)
  const [attributes, setAttributes] = useState(CLOTHING_ATTRIBUTES)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Edit/View target states
  const [selectedItem, setSelectedItem] = useState(null)

  // Form states for adding/editing
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📦')
  const [newAttrName, setNewAttrName] = useState('')
  const [attrOptions, setAttrOptions] = useState([])

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    const newCat = {
      id: Date.now(),
      name: newCatName,
      icon: newCatIcon,
      count: 0,
      isActive: true
    }
    setCategories([newCat, ...categories])
    setNewCatName('')
    setShowAddCategory(false)
    triggerToast('تم إضافة التصنيف بنجاح')
  }

  const handleEditCategory = () => {
    if (!newCatName.trim()) return
    setCategories(categories.map(c => c.id === selectedItem.id ? { ...c, name: newCatName, icon: newCatIcon } : c))
    setShowEditCategory(false)
    triggerToast('تم تحديث التصنيف بنجاح')
  }

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id))
    triggerToast('تم حذف التصنيف بنجاح')
  }

  const handleAddAttribute = () => {
    if (!newAttrName.trim()) return
    const newAttr = {
      id: Date.now(),
      name: newAttrName,
      type: 'قائمة',
      isRequired: true,
      options: ['S', 'M', 'L', 'XL', 'XXL'],
      relatedCats: ['أزياء رجالية', 'أزياء نسائية']
    }
    setAttributes([newAttr, ...attributes])
    setNewAttrName('')
    setShowAddAttribute(false)
    triggerToast('تم إضافة الخاصية بنجاح')
  }

  const handleEditAttribute = () => {
    if (!newAttrName.trim()) return
    setAttributes(attributes.map(a => a.id === selectedItem.id ? { ...a, name: newAttrName, options: attrOptions } : a))
    setShowEditAttribute(false)
    triggerToast('تم تحديث الخاصية بنجاح')
  }

  const handleDeleteAttribute = (id) => {
    setAttributes(attributes.filter(a => a.id !== id))
    triggerToast('تم حذف الخاصية بنجاح')
  }

  const openEditCategory = (cat) => {
    setSelectedItem(cat)
    setNewCatName(cat.name)
    setNewCatIcon(cat.icon)
    setShowEditCategory(true)
  }

  const openAttrDetails = (attr) => {
    setSelectedItem(attr)
    setShowAttrDetails(true)
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
                {categories.filter(cat => cat.name.includes(searchQuery)).map((cat) => (
                  <div key={cat.id} className="group relative flex flex-col items-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 transition-all hover:shadow-md text-center">
                    <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <h3 className="text-base font-bold text-slate-800">{cat.name}</h3>
                    {cat.isActive && (
                      <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-bold text-emerald-700">
                        نشط
                      </span>
                    )}
                    <p className="mt-3 text-lg font-bold text-blue-600">{cat.count} <span className="text-[10px] text-slate-400 font-normal">منتج</span></p>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-50 pt-4 w-full">
                      <button 
                        onClick={() => openEditCategory(cat)}
                        className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-[10px] font-bold"
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
                      <th className="px-4 py-3 font-medium text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attributes.filter(a => a.name.includes(searchQuery)).map((attr) => (
                      <tr key={attr.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-bold text-slate-900 text-lg">{attr.name}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
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
                            <span className="text-slate-400">لا</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-1.5">
                            <button 
                              onClick={() => openAttrDetails(attr)}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" 
                              title="عرض التفاصيل"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button 
                              onClick={() => openEditAttr(attr)}
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" 
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Category Modal (Matching Image 1) */}
      {showEditCategory && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
               <h2 className="text-xl font-bold text-slate-800">تعديل التصنيف</h2>
               <button onClick={() => setShowEditCategory(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 text-right">اسم التصنيف</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 text-right">الأيقونة</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex gap-2 text-2xl p-4 border border-slate-200 rounded-xl overflow-x-auto bg-slate-50 scrollbar-hide">
                    {['👔', '👖', '👗', '🧥', '👚', '🩳', '📦', '👗', '👜', '💍', '⌚', '🎮', '📱'].map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => setNewCatIcon(emoji)}
                        className={`hover:scale-125 transition-transform p-1 ${newCatIcon === emoji ? 'bg-white shadow-md rounded-lg scale-110' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="size-14 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-3xl shadow-sm">
                    {newCatIcon}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-start p-6 bg-slate-50 border-t border-slate-100">
                <button onClick={handleEditCategory} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">حفظ التعديلات</button>
                <button onClick={() => setShowEditCategory(false)} className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal (Matching Image 2) */}
      {showAttrDetails && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
               <h2 className="text-xl font-bold text-slate-800">تفاصيل الخاصية</h2>
               <button onClick={() => setShowAttrDetails(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8 space-y-8">
               <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedItem.name}</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">النوع</span>
                    <span className="rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-blue-700">
                      {selectedItem.type}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">مطلوبة</span>
                    <span className="text-red-500 font-bold flex items-center gap-1 text-sm">
                      <Check className="size-4" />
                      {selectedItem.isRequired ? 'نعم' : 'لا'}
                    </span>
                  </div>
               </div>

               <div className="rounded-2xl bg-blue-50/30 p-5 border border-blue-100/50">
                  <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider">الخيارات المتاحة ({selectedItem.options?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                     {(selectedItem.options || ['S', 'M', 'L', 'XL', 'XXL']).map(opt => (
                       <span key={opt} className="rounded-lg bg-white border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                         {opt}
                       </span>
                     ))}
                  </div>
               </div>

               <div className="rounded-2xl bg-fuchsia-50/30 p-5 border border-fuchsia-100/50">
                  <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider">التصنيفات المرتبطة ({selectedItem.relatedCats?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                     {(selectedItem.relatedCats || ['أزياء رجالية', 'أزياء نسائية']).map(cat => (
                       <span key={cat} className="rounded-lg bg-fuchsia-100 px-4 py-1.5 text-xs font-bold text-fuchsia-700">
                         {cat}
                       </span>
                     ))}
                  </div>
               </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
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
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
               <h2 className="text-xl font-bold text-slate-800">تعديل الخاصية</h2>
               <button onClick={() => setShowEditAttribute(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="size-6" />
               </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 text-left">اسم الخاصية</label>
                <input 
                  type="text" 
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 text-left">نوع الخاصية</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-slate-200 px-5 py-3 text-right outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium bg-white">
                    <option>قائمة اختيارات</option>
                    <option>نص حر</option>
                    <option>رقم</option>
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-3 text-left">الخيارات</label>
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
                        className="flex-1 rounded-xl border border-slate-200 px-5 py-2.5 text-right outline-none focus:border-blue-500 transition-all text-sm font-medium" 
                      />
                    </div>
                  ))}
                  <button 
                    onClick={() => setAttrOptions([...attrOptions, ''])}
                    className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline mt-2 mr-auto"
                  >
                    <Plus className="size-4" />
                    إضافة خيار
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 py-4 border-y border-slate-50">
                <label htmlFor="req_edit" className="text-sm font-bold text-slate-700">خاصية مطلوبة</label>
                <input type="checkbox" id="req_edit" defaultChecked className="size-5 rounded border-slate-300 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 mb-4 text-left">التصنيفات المرتبطة</p>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between">
                       <input type="checkbox" defaultChecked={cat.name.includes('أزياء')} className="size-5 rounded border-slate-300 text-blue-600" />
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                          <span className="text-lg">{cat.icon}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-start p-6 bg-slate-50 border-t border-slate-100">
                <button onClick={handleEditAttribute} className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95">حفظ التعديلات</button>
                <button onClick={() => setShowEditAttribute(false)} className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

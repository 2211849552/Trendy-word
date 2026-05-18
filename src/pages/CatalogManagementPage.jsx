import { useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Tag,
  Package,
  Tags,
  LayoutGrid,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react'
import { StatCard } from '../components/StatCard.jsx'
import { AddCategoryModal } from '../components/catalog/AddCategoryModal.jsx'
import { AddPropertyModal } from '../components/catalog/AddPropertyModal.jsx'
import { EditCategoryModal } from '../components/catalog/EditCategoryModal.jsx'
import { ConfirmDeleteModal } from '../components/catalog/ConfirmDeleteModal.jsx'
import {
  INITIAL_CATEGORIES,
  INITIAL_PROPERTIES,
  PROPERTY_TYPE_LABELS,
  CLOTHING_SIZES,
} from '../data/catalog.js'

function formatNum(n) {
  return Number(n).toLocaleString('ar-LY')
}

function cloneCategories(list) {
  return list.map((c) => ({
    ...c,
    sizes: [...(c.sizes ?? CLOTHING_SIZES)],
  }))
}

function cloneProperties(list) {
  return list.map((p) => ({
    ...p,
    categoryIds: [...p.categoryIds],
    ...(p.listOptions ? { listOptions: [...p.listOptions] } : {}),
  }))
}

export function CatalogManagementPage() {
  const [tab, setTab] = useState('categories')
  const [categories, setCategories] = useState(() => cloneCategories(INITIAL_CATEGORIES))
  const [properties, setProperties] = useState(() => cloneProperties(INITIAL_PROPERTIES))
  const [searchCat, setSearchCat] = useState('')
  const [searchProp, setSearchProp] = useState('')
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [addPropertyOpen, setAddPropertyOpen] = useState(false)
  const [categoryModalKey, setCategoryModalKey] = useState(0)
  const [propertyModalKey, setPropertyModalKey] = useState(0)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editCategoryKey, setEditCategoryKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const stats = useMemo(() => {
    const activeCategories = categories.filter((c) => c.active).length
    const totalProducts = categories.reduce((s, c) => s + c.productCount, 0)
    const subcategories = categories.reduce((s, c) => s + (c.subcategoryCount ?? 0), 0)
    return {
      activeCategories,
      totalProducts,
      propertiesCount: properties.length,
      subcategories,
    }
  }, [categories, properties])

  const filteredCategories = useMemo(() => {
    const q = searchCat.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, searchCat])

  const filteredProperties = useMemo(() => {
    const q = searchProp.trim().toLowerCase()
    if (!q) return properties
    return properties.filter((p) => p.name.toLowerCase().includes(q))
  }, [properties, searchProp])

  const categoryMap = useMemo(() => {
    const m = new Map()
    categories.forEach((c) => m.set(c.id, c))
    return m
  }, [categories])

  function handleAddCategory({ name, emoji, sizes }) {
    setCategories((prev) => [
      {
        id: `cat-${Date.now()}`,
        name,
        emoji,
        productCount: 0,
        active: true,
        subcategoryCount: 0,
        sizes: [...sizes],
      },
      ...prev,
    ])
  }

  function handleSaveCategory({ id, name, emoji, sizes }) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, emoji, sizes: [...sizes] } : c)),
    )
  }

  function handleAddProperty({ name, type, required, categoryIds }) {
    setProperties((prev) => [
      ...prev,
      {
        id: `prop-${Date.now()}`,
        name,
        type,
        required,
        categoryIds,
      },
    ])
  }

  function requestDeleteCategory(cat) {
    setDeleteTarget({
      type: 'category',
      id: cat.id,
      label: cat.name,
    })
  }

  function requestDeleteProperty(row) {
    setDeleteTarget({
      type: 'property',
      id: row.id,
      label: row.name,
    })
  }

  function executeDelete() {
    if (!deleteTarget) return
    if (deleteTarget.type === 'category') {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setProperties((prev) =>
        prev.map((p) => ({
          ...p,
          categoryIds: p.categoryIds.filter((cid) => cid !== deleteTarget.id),
        })),
      )
    } else {
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    }
    setDeleteTarget(null)
  }

  function openEditCategory(cat) {
    setEditCategoryKey((k) => k + 1)
    setEditingCategory(cat)
  }

  const deleteMessage =
    deleteTarget?.type === 'category'
      ? `هل أنت متأكد من حذف التصنيف «${deleteTarget.label}»؟ سيتم إزالته من الخصائص المرتبطة، ولا يمكن التراجع عن هذا الإجراء.`
      : deleteTarget?.type === 'property'
        ? `هل أنت متأكد من حذف الخاصية «${deleteTarget.label}»؟ لا يمكن التراجع عن هذا الإجراء.`
        : ''

  return (
    <>
      <AddCategoryModal
        key={`cat-${categoryModalKey}`}
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onSubmit={handleAddCategory}
      />
      <AddPropertyModal
        key={`prop-${propertyModalKey}`}
        open={addPropertyOpen}
        onClose={() => setAddPropertyOpen(false)}
        categories={categories}
        onSubmit={handleAddProperty}
      />
      {editingCategory ? (
        <EditCategoryModal
          key={`edit-${editCategoryKey}-${editingCategory.id}`}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleSaveCategory}
        />
      ) : null}
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        message={deleteMessage}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
      />

      <header className="mb-8" dir="rtl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          إدارة الكتالوج
        </h1>
        <p className="mt-1 text-slate-500">
          إدارة التصنيفات والخصائص العامة للمنتجات
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="ltr">
        <StatCard
          label="التصنيفات النشطة"
          value={String(stats.activeCategories)}
          change="—"
          trend="up"
          icon={Tag}
          iconClassName="bg-brand-100 text-[#0056D2]"
          omitChange
        />
        <StatCard
          label="إجمالي المنتجات"
          value={formatNum(stats.totalProducts)}
          change="—"
          trend="up"
          icon={Package}
          iconClassName="bg-emerald-100 text-emerald-600"
          omitChange
        />
        <StatCard
          label="خصائص المنتجات"
          value={String(stats.propertiesCount)}
          change="—"
          trend="up"
          icon={Tags}
          iconClassName="bg-violet-100 text-violet-600"
          omitChange
        />
        <StatCard
          label="التصنيفات الفرعية"
          value={formatNum(stats.subcategories)}
          change="—"
          trend="up"
          icon={LayoutGrid}
          iconClassName="bg-brand-100 text-brand-800"
          omitChange
        />
      </div>

      <section
        className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
        dir="rtl"
      >
        <div className="flex gap-8 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('categories')}
            className={[
              '-mb-px border-b-2 pb-3 text-sm font-bold transition-colors',
              tab === 'categories'
                ? 'border-[#0056D2] text-[#0056D2]'
                : 'border-transparent text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            التصنيفات ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('properties')}
            className={[
              '-mb-px border-b-2 pb-3 text-sm font-bold transition-colors',
              tab === 'properties'
                ? 'border-[#0056D2] text-[#0056D2]'
                : 'border-transparent text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            الخصائص ({properties.length})
          </button>
        </div>

        {tab === 'categories' ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchCat}
                  onChange={(e) => setSearchCat(e.target.value)}
                  placeholder="البحث عن تصنيف..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pe-10 ps-3 text-sm outline-none ring-[#0056D2]/20 focus:border-[#0056D2] focus:ring-2"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setCategoryModalKey((k) => k + 1)
                  setAddCategoryOpen(true)
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0056D2] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0046b0]"
              >
                <Plus className="size-5" strokeWidth={2.5} aria-hidden />
                إضافة تصنيف
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {filteredCategories.map((cat) => (
                <article
                  key={cat.id}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm ring-1 ring-slate-50"
                >
                  <div className="mx-auto text-5xl leading-none" aria-hidden>
                    {cat.emoji}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{cat.name}</h3>
                  <span className="mx-auto mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    نشط
                  </span>
                  <div className="mt-3 flex flex-wrap justify-center gap-1">
                    {(cat.sizes ?? CLOTHING_SIZES).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-600 ring-1 ring-slate-200/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-3xl font-bold tabular-nums text-[#0056D2]">
                    {formatNum(cat.productCount)}
                  </p>
                  <p className="text-xs text-slate-500">منتج</p>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-violet-200 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                    >
                      <Pencil className="size-3.5" />
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteCategory(cat)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-rose-200 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" />
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {filteredCategories.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">لا توجد تصنيفات مطابقة للبحث.</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchProp}
                  onChange={(e) => setSearchProp(e.target.value)}
                  placeholder="البحث عن خاصية..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pe-10 ps-3 text-sm outline-none ring-[#0056D2]/20 focus:border-[#0056D2] focus:ring-2"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setPropertyModalKey((k) => k + 1)
                  setAddPropertyOpen(true)
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0056D2] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0046b0]"
              >
                <Plus className="size-5" strokeWidth={2.5} aria-hidden />
                إضافة خاصية
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-start">
                    <th className="px-4 py-3 font-semibold text-slate-700">اسم الخاصية</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">النوع</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">مطلوبة</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">التصنيفات</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div>{row.name}</div>
                        {row.listOptions?.length ? (
                          <div className="mt-1 text-xs text-slate-500">
                            القيم: {row.listOptions.join('، ')}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
                          {PROPERTY_TYPE_LABELS[row.type] ?? row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.required ? (
                          <span className="font-semibold text-rose-600">نعم</span>
                        ) : (
                          <span className="text-slate-500">لا</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {row.categoryIds.map((cid) => {
                            const c = categoryMap.get(cid)
                            if (!c) return null
                            return (
                              <span
                                key={cid}
                                className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-violet-100"
                              >
                                {c.name}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="icon-btn-view"
                            title="عرض"
                            aria-label={`عرض ${row.name}`}
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn-edit"
                            title="تعديل"
                            aria-label={`تعديل ${row.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProperty(row)}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                            title="حذف"
                            aria-label={`حذف ${row.name}`}
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
            {filteredProperties.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">لا توجد خصائص مطابقة للبحث.</p>
            ) : null}
          </div>
        )}
      </section>
    </>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  User,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Package,
  Loader2,
} from 'lucide-react'
import { fetchStoreProductsForDetail } from '../../api/products.js'
import { StoreImage } from './StoreImage.jsx'

const STATUS_LABELS = {
  active: 'نشط',
  disabled: 'معطل',
  pending: 'معلق',
}

const PRODUCT_STATUS_LABELS = {
  active: 'نشط',
  archived: 'مؤرشف',
}

function ProductThumbnail({ src, name }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-brand-300">
        <Package className="size-5 text-white/50" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className="size-14 shrink-0 rounded-xl border border-white/10 object-cover bg-brand-300"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض منتجات هذا المتجر.'
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function StoreDetailModal({
  store,
  open,
  loading = false,
  onClose,
  onUpdateStore,
  onUpdateDeliveryPrices,
  onSettleCustody,
  onStoreUpdated,
}) {
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [editForm, setEditForm] = useState({ name: '', phone: '', description: '' })
  const [deliveryPrices, setDeliveryPrices] = useState({})
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadProducts = useCallback(async (storeId) => {
    if (!storeId) return
    setProductsLoading(true)
    setProductsError('')
    try {
      setProducts(await fetchStoreProductsForDetail(storeId))
    } catch (err) {
      setProducts([])
      setProductsError(apiErrorMessage(err, 'تعذّر تحميل منتجات المتجر.'))
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open || !store?.id || loading) return
    loadProducts(store.id)
  }, [open, store?.id, loading, loadProducts])

  useEffect(() => {
    if (!open) {
      setProducts([])
      setProductsError('')
      setActionMessage('')
      setActionError('')
    }
  }, [open])

  useEffect(() => {
    if (!store) return
    setEditForm({
      name: store.name ?? '',
      phone: store.phone && store.phone !== '—' ? store.phone : '',
      description: store.description ?? '',
    })
    const prices = store.deliveryPrices ?? store.raw?.delivery_prices ?? {}
    setDeliveryPrices(
      prices && typeof prices === 'object' ? { ...prices } : {},
    )
  }, [store])

  if (!open || !store) return null

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-brand-200 shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-xl font-bold text-white">تفاصيل المتجر</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-brand-300 hover:text-white/70 transition-colors">
            <X className="size-6" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-white/55">جاري تحميل التفاصيل...</p>
          ) : (
            <>
              <div className="text-center">
                <StoreImage
                  src={store.image}
                  name={store.name}
                  className="mx-auto mb-4 size-28 rounded-2xl shadow-premium ring-2 ring-white/10"
                />
                <h3 className="text-2xl font-bold text-white">{store.name}</h3>
                <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">
                  {store.description || 'لا يوجد وصف للمتجر.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">التاجر</p>
                    <p className="font-bold text-white mt-1">{store.merchant}</p>
                  </div>
                  <User className="size-5 text-white/50" />
                </div>
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">المنطقة</p>
                    <p className="font-bold text-white mt-1">{store.city}</p>
                  </div>
                  <MapPin className="size-5 text-white/50" />
                </div>
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">البريد الإلكتروني</p>
                    <p className="font-bold text-white mt-1" dir="ltr">{store.email}</p>
                  </div>
                  <Mail className="size-5 text-white/50" />
                </div>
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">الهاتف</p>
                    <p className="font-bold text-white mt-1 tabular-nums" dir="ltr">{store.phone}</p>
                  </div>
                  <Phone className="size-5 text-white/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5">
                  <div className="text-right">
                    <p className="text-xs text-white/60">تاريخ الإنشاء</p>
                    <p className="font-bold text-white mt-1 tabular-nums">{store.createdAt || '—'}</p>
                  </div>
                  <Calendar className="size-5 text-white/50" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5">
                  <div className="text-right">
                    <p className="text-xs text-white/60">نوع المتجر</p>
                    <p className="font-bold text-white mt-1">{store.type || '—'}</p>
                  </div>
                  <ShoppingBag className="size-5 text-white/50" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5 md:col-span-2">
                  <div className="text-right">
                    <p className="text-xs text-white/60">الحالة</p>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${
                      store.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : store.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-rose-100 text-rose-700'
                    }`}>
                      {STATUS_LABELS[store.status] ?? store.status}
                    </span>
                    {store.deactivationReason ? (
                      <p className="mt-2 text-xs text-white/55">سبب التعطيل: {store.deactivationReason}</p>
                    ) : null}
                  </div>
                  <CheckCircle2 className="size-5 text-white/50" />
                </div>
              </div>

              {(onUpdateStore || onUpdateDeliveryPrices || onSettleCustody) ? (
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-lg font-bold text-white">إدارة المتجر</h4>
                  {actionMessage ? (
                    <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">{actionMessage}</p>
                  ) : null}
                  {actionError ? (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{actionError}</p>
                  ) : null}

                  {onUpdateStore ? (
                    <form
                      className="space-y-3 rounded-xl border border-white/10 bg-brand-300/50 p-4"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setActionLoading(true)
                        setActionError('')
                        try {
                          const updated = await onUpdateStore(store.id, {
                            name: editForm.name.trim(),
                            phone: editForm.phone.trim(),
                            description: editForm.description.trim() || null,
                          })
                          if (updated) onStoreUpdated?.(updated)
                          setActionMessage('تم تحديث بيانات المتجر.')
                          setTimeout(() => setActionMessage(''), 3000)
                        } catch (err) {
                          setActionError(apiErrorMessage(err, 'تعذّر تحديث المتجر.'))
                        } finally {
                          setActionLoading(false)
                        }
                      }}
                    >
                      <p className="text-sm font-medium text-white/70">تعديل البيانات الأساسية</p>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="اسم المتجر"
                        className="input-brand"
                        required
                      />
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="الهاتف"
                        className="input-brand"
                        dir="ltr"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="الوصف"
                        rows={2}
                        className="input-brand resize-none"
                      />
                      <button type="submit" disabled={actionLoading} className="btn-primary disabled:opacity-60">
                        {actionLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                      </button>
                    </form>
                  ) : null}

                  {onUpdateDeliveryPrices && Object.keys(deliveryPrices).length > 0 ? (
                    <form
                      className="space-y-3 rounded-xl border border-white/10 bg-brand-300/50 p-4"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setActionLoading(true)
                        setActionError('')
                        try {
                          const numericPrices = Object.fromEntries(
                            Object.entries(deliveryPrices).map(([zoneId, price]) => [
                              zoneId,
                              Number(price) || 0,
                            ]),
                          )
                          const updated = await onUpdateDeliveryPrices(store.id, numericPrices)
                          if (updated) onStoreUpdated?.(updated)
                          setActionMessage('تم تحديث أسعار التوصيل.')
                          setTimeout(() => setActionMessage(''), 3000)
                        } catch (err) {
                          setActionError(apiErrorMessage(err, 'تعذّر تحديث أسعار التوصيل.'))
                        } finally {
                          setActionLoading(false)
                        }
                      }}
                    >
                      <p className="text-sm font-medium text-white/70">أسعار التوصيل حسب المنطقة</p>
                      {Object.entries(deliveryPrices).map(([zoneId, price]) => (
                        <div key={zoneId} className="flex items-center gap-3">
                          <span className="text-sm text-white/60 shrink-0">منطقة {zoneId}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) =>
                              setDeliveryPrices((prev) => ({ ...prev, [zoneId]: e.target.value }))
                            }
                            className="input-brand flex-1"
                            dir="ltr"
                          />
                        </div>
                      ))}
                      <button type="submit" disabled={actionLoading} className="btn-primary disabled:opacity-60">
                        حفظ أسعار التوصيل
                      </button>
                    </form>
                  ) : null}

                  {onSettleCustody ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={async () => {
                        if (!window.confirm('هل تريد تسوية عهدة المتجر؟')) return
                        setActionLoading(true)
                        setActionError('')
                        try {
                          await onSettleCustody(store.id)
                          setActionMessage('تم تسوية العهدة بنجاح.')
                          setTimeout(() => setActionMessage(''), 3000)
                        } catch (err) {
                          setActionError(apiErrorMessage(err, 'تعذّر تسوية العهدة.'))
                        } finally {
                          setActionLoading(false)
                        }
                      }}
                      className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-60"
                    >
                      تسوية العهدة النقدية
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="border-t border-white/5 pt-6 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white">منتجات المتجر</h4>
                  <p className="text-sm text-white/60">صورة كل منتج من قائمة منتجات المتجر</p>
                </div>

                {productsError ? (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {productsError}
                  </p>
                ) : null}

                {productsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-white/60">
                    <Loader2 className="size-5 animate-spin" />
                    جاري تحميل المنتجات...
                  </div>
                ) : products.length === 0 && !productsError ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-brand-300 py-10 text-center">
                    <Package className="size-8 text-white/50 mb-3" />
                    <p className="text-sm text-white/60">لا توجد منتجات لهذا المتجر.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
                        <tr>
                          <th className="px-3 py-2.5 font-medium">المنتج</th>
                          <th className="px-3 py-2.5 font-medium">التصنيف</th>
                          <th className="px-3 py-2.5 font-medium">السعر</th>
                          <th className="px-3 py-2.5 font-medium">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-brand-300/50 transition-colors">
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                <ProductThumbnail src={product.image} name={product.name} />
                                <span className="font-bold text-white">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-white/70">{product.category}</td>
                            <td className="px-3 py-3 font-bold text-white tabular-nums" dir="ltr">
                              {product.price} د.ل
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                                product.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {PRODUCT_STATUS_LABELS[product.status] ?? product.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-white/10 bg-brand-300/50 px-4 py-3 text-sm text-white/60">
                      عرض {products.length} {products.length === 1 ? 'منتج' : 'منتجات'}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-brand-300 border-t border-white/5">
          <button onClick={onClose} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-premium hover:bg-slate-800 transition-all active:scale-95">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}

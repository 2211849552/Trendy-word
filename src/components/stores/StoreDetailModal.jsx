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
  Wallet,
  Search,
} from 'lucide-react'
import { fetchStoreProductsForDetail, fetchMyStoreProductsForDetail } from '../../api/products.js'
import {
  getStoreCustodySummaryForStore,
  getStoreCustodyLogsForStore,
  extractCustodyLogs,
  mapCustodySummary,
  mapCustodyLog,
  fetchStoreOrdersCount,
  formatCustodyDate,
  formatCustodyAmount,
} from '../../api/stores.js'
import { mapSettleCustodyResponse } from '../../api/adminStores.js'
import { ConfirmDeleteModal } from '../catalog/ConfirmDeleteModal.jsx'
import { StoreImage } from './StoreImage.jsx'
import { StoreDeliveryPricesSection, formatDeliveryPrice } from './StoreDeliveryPricesSection.jsx'
import { StorePromotionsSection } from './StorePromotionsSection.jsx'
import { getDeactivationReason } from '../../utils/deactivationReasons.js'

const STATUS_LABELS = {
  active: 'نشط',
  disabled: 'معطل',
  pending: 'معلق',
}

const EMPTY_DELIVERY_PRICES = {}
const EMPTY_ZONE_DELIVERY_PRICES = []

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
  onSettleCustody,
  onStoreUpdated,
  canEditDeliveryPrices = false,
  canViewStoreProducts = false,
  canViewStorePromotions = false,
}) {
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [productSearchInput, setProductSearchInput] = useState('')
  const [appliedProductSearch, setAppliedProductSearch] = useState('')
  const [productStatusFilter, setProductStatusFilter] = useState('all')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [settleCustodyOpen, setSettleCustodyOpen] = useState(false)
  const [custodySummary, setCustodySummary] = useState(null)
  const [custodyLogs, setCustodyLogs] = useState([])
  const [storeOrdersCount, setStoreOrdersCount] = useState(null)
  const [custodyLoading, setCustodyLoading] = useState(false)
  const [custodyError, setCustodyError] = useState('')

  const loadProducts = useCallback(async (storeId, { searchName = '', status = 'all' } = {}) => {
    if (!storeId) return
    setProductsLoading(true)
    setProductsError('')
    try {
      const params = {}
      const trimmed = searchName.trim()
      if (trimmed) params.name = trimmed

      if (status && status !== 'all') {
        params.status = status
        try {
          setProducts(await fetchMyStoreProductsForDetail(storeId, params))
          return
        } catch (myStoreErr) {
          if (myStoreErr?.status !== 403) throw myStoreErr
        }
      }

      let products = await fetchStoreProductsForDetail(storeId, params)
      if (status && status !== 'all') {
        products = products.filter((product) => product.status === status)
      }
      setProducts(products)
    } catch (err) {
      setProducts([])
      setProductsError(apiErrorMessage(err, 'تعذّر تحميل منتجات المتجر.'))
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const handleProductSearch = useCallback(() => {
    if (!store?.id) return
    const query = productSearchInput.trim()
    setAppliedProductSearch(query)
    loadProducts(store.id, { searchName: query, status: productStatusFilter })
  }, [store?.id, productSearchInput, productStatusFilter, loadProducts])

  const handleProductStatusFilterChange = useCallback((status) => {
    setProductStatusFilter(status)
    if (!store?.id) return
    loadProducts(store.id, { searchName: appliedProductSearch, status })
  }, [store?.id, appliedProductSearch, loadProducts])

  const loadCustody = useCallback(async (storeId, storeInfo = {}) => {
    if (!storeId) return
    setCustodyLoading(true)
    setCustodyError('')
    setStoreOrdersCount(null)
    try {
      const [summaryData, logsData, ordersCount] = await Promise.all([
        getStoreCustodySummaryForStore(storeId),
        getStoreCustodyLogsForStore(storeId),
        fetchStoreOrdersCount(storeId, {
          storeName: storeInfo.name,
          knownCount: storeInfo.orders,
        }),
      ])
      setCustodySummary(mapCustodySummary(summaryData))
      setCustodyLogs(extractCustodyLogs(logsData).map(mapCustodyLog))
      setStoreOrdersCount(ordersCount)
    } catch (err) {
      setCustodySummary(null)
      setCustodyLogs([])
      setStoreOrdersCount(null)
      if (err?.status === 403) {
        setCustodyError('ليس لديك صلاحية عرض بيانات العهدة لهذا المتجر.')
      } else {
        setCustodyError(apiErrorMessage(err, 'تعذّر تحميل بيانات العهدة.'))
      }
    } finally {
      setCustodyLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open || !store?.id || loading) return
    if (canViewStoreProducts) loadProducts(store.id)
    if (onSettleCustody) loadCustody(store.id, store)
  }, [open, store?.id, loading, loadProducts, loadCustody, onSettleCustody, canViewStoreProducts])

  useEffect(() => {
    if (!open) {
      setProducts([])
      setProductsError('')
      setProductSearchInput('')
      setAppliedProductSearch('')
      setProductStatusFilter('all')
      setActionMessage('')
      setActionError('')
      setSettleCustodyOpen(false)
      setCustodySummary(null)
      setCustodyLogs([])
      setStoreOrdersCount(null)
      setCustodyError('')
    }
  }, [open])

  async function handleSettleCustody() {
    if (!store?.id || !onSettleCustody) return
    setActionLoading(true)
    setActionError('')
    try {
      const result = await onSettleCustody(store.id)
      const settled = mapSettleCustodyResponse(result)
      setSettleCustodyOpen(false)
      await loadCustody(store.id)
      onStoreUpdated?.({ ...store, custodyBalance: settled.custodyBalance })
      setActionMessage(
        settled.settledAmount > 0
          ? `تم تسوية العهدة بنجاح (${formatCustodyAmount(settled.settledAmount)}).`
          : 'تم تسوية العهدة بنجاح.',
      )
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setActionError(apiErrorMessage(err, 'تعذّر تسوية العهدة.'))
    } finally {
      setActionLoading(false)
    }
  }

  if (!open || !store) return null

  const deliveryPriceSummary = store.zoneDeliveryPrices ?? []
  const displayedDeactivationReason =
    store.deactivationReason || (store?.id ? getDeactivationReason('store', store.id) : '')

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-brand-200 shadow-2xl animate-in zoom-in-95 duration-200"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-detail-title"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 id="store-detail-title" className="text-xl font-bold text-white">تفاصيل المتجر</h2>
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
                    {displayedDeactivationReason ? (
                      <p className="mt-2 text-xs text-white/55">سبب التعطيل: {displayedDeactivationReason}</p>
                    ) : null}
                  </div>
                  <CheckCircle2 className="size-5 text-white/50" />
                </div>
              </div>

              {canEditDeliveryPrices && !loading && store?.id ? (
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-lg font-bold text-white">أسعار التوصيل للمتجر</h4>
                  {deliveryPriceSummary.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {deliveryPriceSummary.map((row) => (
                        <span
                          key={row.zoneId}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-brand-300/80 px-3 py-1 text-xs text-white/80"
                        >
                          <span>{row.zoneName ?? `منطقة ${row.zoneId}`}</span>
                          <span className="font-bold tabular-nums text-white" dir="ltr">
                            {formatDeliveryPrice(row.deliveryPrice)}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <StoreDeliveryPricesSection
                    storeId={store.id}
                    initialPrices={store.deliveryPrices ?? EMPTY_DELIVERY_PRICES}
                    initialZoneDeliveryPrices={store.zoneDeliveryPrices ?? EMPTY_ZONE_DELIVERY_PRICES}
                    canEdit={canEditDeliveryPrices}
                    onSaved={(updated) => {
                      if (updated) onStoreUpdated?.(updated)
                    }}
                  />
                </div>
              ) : null}

              {onSettleCustody ? (
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <h4 className="text-lg font-bold text-white">إدارة المتجر</h4>
                  {actionMessage ? (
                    <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">{actionMessage}</p>
                  ) : null}
                  {actionError ? (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{actionError}</p>
                  ) : null}

                  <div className="space-y-4 rounded-xl border border-white/10 bg-brand-300/50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-white/70">العهدة النقدية</p>
                        {custodyLoading ? (
                          <Loader2 className="size-4 animate-spin text-white/50" />
                        ) : null}
                      </div>

                      {custodyError ? (
                        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                          {custodyError}
                        </p>
                      ) : null}

                      {custodySummary && !custodyError ? (
                        <>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
                              <p className="text-xs text-white/60">الرصيد المستحق</p>
                              <p className="mt-1 text-lg font-bold text-amber-300 tabular-nums" dir="ltr">
                                {formatCustodyAmount(custodySummary.totalOwed, custodySummary.currency)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
                              <p className="text-xs text-white/60">إجمالي الطلبات</p>
                              <p className="mt-1 text-lg font-bold text-white tabular-nums">
                                {storeOrdersCount ?? '—'}
                              </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
                              <p className="text-xs text-white/60">آخر تسوية</p>
                              <p className="mt-1 text-sm font-bold text-white">
                                {formatCustodyDate(custodySummary.lastSettledAt)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
                              <p className="text-xs text-white/60">الحالة</p>
                              <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                custodySummary.status === 'pending_settlement'
                                  ? 'bg-amber-500/15 text-amber-300'
                                  : 'bg-emerald-500/15 text-emerald-300'
                              }`}>
                                {custodySummary.statusText}
                              </span>
                            </div>
                          </div>

                          {custodyLogs.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-white/10">
                              <table className="w-full text-right text-sm">
                                <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
                                  <tr>
                                    <th className="px-3 py-2 font-medium">التاريخ</th>
                                    <th className="px-3 py-2 font-medium">الإجراء</th>
                                    <th className="px-3 py-2 font-medium">المبلغ</th>
                                    <th className="px-3 py-2 font-medium">الرصيد بعد</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {custodyLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-brand-300/50">
                                      <td className="px-3 py-2.5 text-xs text-white/70">
                                        {formatCustodyDate(log.date)}
                                      </td>
                                      <td className="px-3 py-2.5 text-white">{log.action}</td>
                                      <td className="px-3 py-2.5 font-bold tabular-nums text-white" dir="ltr">
                                        {log.amountFormatted} د.ل
                                      </td>
                                      <td className="px-3 py-2.5 tabular-nums text-white/80" dir="ltr">
                                        {formatCustodyAmount(log.balanceAfter, custodySummary.currency)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-white/55">لا يوجد سجل حركات للعهدة بعد.</p>
                          )}
                        </>
                      ) : null}

                      <button
                        type="button"
                        disabled={actionLoading || custodyLoading || (custodySummary?.totalOwed ?? 0) <= 0}
                        onClick={() => setSettleCustodyOpen(true)}
                        className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        تسوية العهدة النقدية
                      </button>
                      {!custodyLoading && custodySummary && custodySummary.totalOwed <= 0 ? (
                        <p className="text-xs text-white/50">لا توجد عهدة مستحقة للتسوية حالياً.</p>
                      ) : null}
                  </div>
                </div>
              ) : null}

              {canViewStorePromotions && !loading && store?.id ? (
                <StorePromotionsSection storeId={store.id} enabled={canViewStorePromotions} />
              ) : null}

              {canViewStoreProducts ? (
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white">منتجات المتجر</h4>
                  <p className="text-sm text-white/60">صورة كل منتج من قائمة منتجات المتجر</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={productStatusFilter}
                    onChange={(e) => handleProductStatusFilterChange(e.target.value)}
                    disabled={productsLoading}
                    className="rounded-xl border border-white/10 bg-brand-300/80 py-2.5 ps-3 pe-8 text-sm font-medium text-white/80 outline-none transition focus:border-brand-300 focus:bg-brand-200 focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="active">نشط</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                  <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                    <input
                      type="search"
                      placeholder="البحث عن منتج بالاسم..."
                      value={productSearchInput}
                      onChange={(e) => setProductSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleProductSearch()
                        }
                      }}
                      className="w-full rounded-xl border border-white/10 bg-brand-300/80 py-2.5 pe-10 ps-3 text-sm text-white outline-none transition focus:border-brand-300 focus:bg-brand-200 focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleProductSearch}
                    disabled={productsLoading}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-premium transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    بحث
                  </button>
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
                    <p className="text-sm text-white/60">
                      {appliedProductSearch || productStatusFilter !== 'all'
                        ? 'لا توجد منتجات مطابقة للبحث أو الفلترة.'
                        : 'لا توجد منتجات لهذا المتجر.'}
                    </p>
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
                      {(() => {
                        const countLabel = products.length === 1 ? 'منتج' : 'منتجات'
                        if (appliedProductSearch && productStatusFilter !== 'all') {
                          return `عرض ${products.length} ${countLabel} — بحث: «${appliedProductSearch}» — الحالة: ${PRODUCT_STATUS_LABELS[productStatusFilter] ?? productStatusFilter}`
                        }
                        if (appliedProductSearch) {
                          return `عرض ${products.length} ${products.length === 1 ? 'نتيجة' : 'نتائج'} للبحث عن «${appliedProductSearch}»`
                        }
                        if (productStatusFilter !== 'all') {
                          return `عرض ${products.length} ${countLabel} — الحالة: ${PRODUCT_STATUS_LABELS[productStatusFilter] ?? productStatusFilter}`
                        }
                        return `عرض ${products.length} ${countLabel}`
                      })()}
                    </div>
                  </div>
                )}
              </div>
              ) : null}
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

  return (
    <>
      {createPortal(overlay, document.body)}
      <ConfirmDeleteModal
        open={settleCustodyOpen}
        title="تسوية العهدة النقدية"
        heading="تأكيد تسوية العهدة"
        message="هل تريد تسوية عهدة المتجر؟"
        confirmLabel="تسوية العهدة"
        tone="primary"
        icon={Wallet}
        loading={actionLoading}
        onCancel={() => {
          if (!actionLoading) setSettleCustodyOpen(false)
        }}
        onConfirm={handleSettleCustody}
      />
    </>
  )
}

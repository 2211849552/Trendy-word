import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Loader2, Truck } from 'lucide-react'
import { fetchAvailableZones } from '../../api/zones.js'
import {
  getStoreDeliveryPrices,
  updateStoreDeliveryPrices,
  mapAdminStoreDetail,
  mapStoreDeliveryPricesResponse,
} from '../../api/adminStores.js'

const DEFAULT_EMPTY_PRICE = 10

function parsePriceForSave(value) {
  const trimmed = String(value ?? '').trim()
  if (trimmed === '') return DEFAULT_EMPTY_PRICE
  const num = Number(trimmed)
  return Number.isFinite(num) && num >= 0 ? num : DEFAULT_EMPTY_PRICE
}

function formatDeliveryPrice(price) {
  const trimmed = String(price ?? '').trim()
  if (trimmed === '') return `${DEFAULT_EMPTY_PRICE} د.ل`
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value < 0) return `${DEFAULT_EMPTY_PRICE} د.ل`
  if (value === 0) return 'مجاني'
  return `${value} د.ل`
}

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية إدارة أسعار التوصيل.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return err?.message || 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

function mergeZonePrices(zones, pricesMap, namedPrices = []) {
  const nameByZoneId = new Map(
    namedPrices.map((row) => [String(row.zoneId), row.zoneName]).filter(([, name]) => name),
  )

  return zones.map((zone) => ({
    zoneId: String(zone.id),
    zoneName: nameByZoneId.get(String(zone.id)) ?? zone.name,
    price: pricesMap[zone.id] ?? pricesMap[String(zone.id)] ?? '',
  }))
}

function applyPricesToRows(zones, mappedPrices) {
  return mergeZonePrices(
    zones,
    mappedPrices.prices,
    mappedPrices.zoneDeliveryPrices,
  )
}

function pricesFromShowApi(initialPrices = {}, initialZoneDeliveryPrices = []) {
  const prices = { ...initialPrices }

  const zoneDeliveryPrices = (initialZoneDeliveryPrices ?? [])
    .map((row) => ({
      zoneId: String(row.zoneId ?? row.zone_id ?? row.id ?? ''),
      zoneName: row.zoneName ?? row.zone_name ?? row.name ?? row.zone?.name ?? null,
      deliveryPrice: Number(row.deliveryPrice ?? row.delivery_price ?? row.price ?? 0),
    }))
    .filter((row) => row.zoneId)

  zoneDeliveryPrices.forEach((row) => {
    if (prices[row.zoneId] == null) {
      prices[row.zoneId] = row.deliveryPrice
    }
  })

  return { prices, zoneDeliveryPrices }
}

function zonesFromDeliveryPrices(zoneDeliveryPrices = []) {
  return zoneDeliveryPrices.map((row) => ({
    id: String(row.zoneId),
    name: row.zoneName ?? `منطقة ${row.zoneId}`,
  }))
}

export function StoreDeliveryPricesSection({
  storeId,
  initialPrices = {},
  initialZoneDeliveryPrices = [],
  canEdit = false,
  onSaved,
  compact = false,
}) {
  const [zones, setZones] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const pricesSnapshotRef = useRef('')

  const propsPrices = useMemo(
    () => pricesFromShowApi(initialPrices, initialZoneDeliveryPrices),
    [initialPrices, initialZoneDeliveryPrices],
  )

  const loadData = useCallback(async () => {
    if (!storeId) return
    setLoading(true)
    setLoadError('')

    try {
      const [zonesResult, pricesResult] = await Promise.allSettled([
        fetchAvailableZones(),
        getStoreDeliveryPrices(storeId),
      ])

      let mappedPrices = propsPrices
      if (pricesResult.status === 'fulfilled') {
        const fromApi = mapStoreDeliveryPricesResponse(pricesResult.value)
        if (fromApi.zoneDeliveryPrices.length > 0 || Object.keys(fromApi.prices).length > 0) {
          mappedPrices = fromApi
        }
      }

      let zonesList = zonesResult.status === 'fulfilled' ? zonesResult.value : []

      if (zonesList.length === 0 && mappedPrices.zoneDeliveryPrices.length > 0) {
        zonesList = zonesFromDeliveryPrices(mappedPrices.zoneDeliveryPrices)
      }

      if (zonesList.length === 0) {
        if (zonesResult.status === 'rejected') {
          throw zonesResult.reason
        }
        setZones([])
        setRows([])
        return
      }

      pricesSnapshotRef.current = JSON.stringify(mappedPrices)
      setZones(zonesList)
      setRows(applyPricesToRows(zonesList, mappedPrices))
    } catch (err) {
      setZones([])
      setRows([])
      setLoadError(apiErrorMessage(err, 'تعذّر تحميل أسعار التوصيل.'))
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (zones.length === 0) return
    const nextKey = JSON.stringify(propsPrices)
    if (nextKey === pricesSnapshotRef.current) return
    pricesSnapshotRef.current = nextKey
    setRows(applyPricesToRows(zones, propsPrices))
  }, [zones, propsPrices])

  useEffect(() => {
    if (!saveMessage) return undefined
    const timer = setTimeout(() => setSaveMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [saveMessage])

  function handlePriceChange(zoneId, value) {
    setRows((prev) =>
      prev.map((item) =>
        item.zoneId === zoneId ? { ...item, price: value } : item,
      ),
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canEdit || !storeId) return

    setSaveLoading(true)
    setSaveError('')
    try {
      const pricesByZone = Object.fromEntries(
        rows.map((row) => [row.zoneId, parsePriceForSave(row.price)]),
      )
      const data = await updateStoreDeliveryPrices(storeId, pricesByZone)
      const updated = mapAdminStoreDetail(data)
      const mappedPrices = pricesFromShowApi(
        updated.deliveryPrices ?? pricesByZone,
        updated.zoneDeliveryPrices ?? [],
      )
      pricesSnapshotRef.current = JSON.stringify(mappedPrices)
      setRows(applyPricesToRows(zones, mappedPrices))
      onSaved?.(updated)
      setSaveMessage('تم حفظ أسعار التوصيل بنجاح.')
    } catch (err) {
      setSaveError(apiErrorMessage(err, 'تعذّر حفظ أسعار التوصيل.'))
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-white/60">
        <Loader2 className="size-4 animate-spin" />
        جاري تحميل أسعار التوصيل...
      </div>
    )
  }

  if (loadError) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {loadError}
      </p>
    )
  }

  if (zones.length === 0) {
    return (
      <p className="text-sm text-white/55">
        لا توجد مناطق مسجّلة. أضيفي المناطق من صفحة «إدارة المناطق» أولاً.
      </p>
    )
  }

  const title = compact ? 'أسعار التوصيل' : 'أسعار التوصيل حسب المنطقة'

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-brand-300/50 p-4">
      <div className="flex items-center gap-2">
        <Truck className="size-4 text-white/50" />
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          {canEdit ? (
            <p className="mt-1 text-xs text-white/50">الحقل الفارغ = 10 د.ل — 0 = توصيل مجاني</p>
          ) : (
            <p className="mt-1 text-xs text-white/45">تعديل الأسعار متاح لمدير النظام ومسؤول المتاجر فقط.</p>
          )}
        </div>
      </div>

      {saveMessage ? (
        <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {saveMessage}
        </p>
      ) : null}
      {saveError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {saveError}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-right text-sm">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-2 font-medium">المنطقة</th>
                <th className="px-3 py-2 font-medium">سعر التوصيل (د.ل)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.zoneId}>
                  <td className="px-3 py-2.5 text-white">{row.zoneName}</td>
                  <td className="px-3 py-2.5">
                    {canEdit ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price}
                        onChange={(e) => handlePriceChange(row.zoneId, e.target.value)}
                        className="input-brand w-full max-w-[180px]"
                        dir="ltr"
                        placeholder="10"
                        aria-label={`سعر التوصيل لـ ${row.zoneName}`}
                      />
                    ) : (
                      <span className="font-bold text-white tabular-nums" dir="ltr">
                        {formatDeliveryPrice(row.price)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canEdit ? (
          <button type="submit" disabled={saveLoading} className="btn-primary disabled:opacity-60">
            {saveLoading ? 'جاري الحفظ...' : 'حفظ أسعار التوصيل'}
          </button>
        ) : null}
      </form>
    </div>
  )
}

export { formatDeliveryPrice }

import { useState, useEffect, useCallback, useRef } from 'react'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import {
  Truck,
  UserCheck,
  AlertCircle,
  Search,
  Eye,
  Ban,
  Plus,
  X,
  Star,
  Phone,
  MapPin,
  Loader2,
  MessageCircle,
} from 'lucide-react'
import {
  getDrivers,
  loadDriverAdminStats,
  createDriver,
  updateDriver,
  deactivateDriver,
  reactivateDriver,
  extractDriverList,
  extractPaginationMeta,
  mapDriver,
  mapDriverDetail,
  buildDriverQueryParams,
  buildDriverStats,
  applyDriverListFilters,
  emptyDriverForm,
  buildCreateDriverPayload,
  validateCreateDriverForm,
  firstValidationError,
  DRIVER_VEHICLE_TYPES,
  DRIVER_CREATE_FIELDS,
  DRIVER_UPDATE_FIELDS,
  emptyDriverEditForm,
  buildUpdateDriverPayload,
} from '../api/adminDrivers.js'
import { fetchAvailableZones } from '../api/zones.js'
import { DriverChatModal } from '../components/drivers/DriverChatModal.jsx'
import { DriverCustodyViewSection } from '../components/drivers/DriverCustodyViewSection.jsx'
import { DriverCustodySection } from '../components/drivers/DriverCustodySection.jsx'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية إدارة السائقين.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

const driverFieldClass =
  'w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-500'

function DriverCreateField({
  field,
  value,
  onChange,
  zones,
  zonesLoading,
  zonesError,
  onReloadZones,
}) {
  const label = `${field.label}${field.required ? ' *' : ''}`
  const inputId = `driver-${field.key}`

  if (field.type === 'zone') {
    const emptyZones = !zonesLoading && !zonesError && zones.length === 0

    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80 mb-1.5">
          {label}
        </label>
        <select
          id={inputId}
          name={field.key}
          required={field.required}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          disabled={zonesLoading || emptyZones}
          className={`${driverFieldClass} disabled:opacity-60`}
        >
          <option value="">
            {zonesLoading
              ? 'جاري تحميل المناطق...'
              : emptyZones
                ? 'لا توجد مناطق متاحة'
                : 'اختر المنطقة'}
          </option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
        {zonesError ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-xs text-red-300">{zonesError}</p>
            {onReloadZones ? (
              <button
                type="button"
                onClick={onReloadZones}
                className="text-xs font-bold text-brand-300 hover:text-brand-200"
              >
                إعادة المحاولة
              </button>
            ) : null}
          </div>
        ) : null}
        {emptyZones ? (
          <p className="mt-1 text-xs text-white/50">
            لا توجد مناطق في النظام. أضيفي مناطق من صفحة «إدارة المناطق» ثم اضغطي «إعادة المحاولة».
          </p>
        ) : null}
      </div>
    )
  }

  if (field.type === 'vehicle_type') {
    return (
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-white/80 mb-1.5">
          {label}
        </label>
        <select
          id={inputId}
          name={field.key}
          required={field.required}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={driverFieldClass}
        >
          {DRIVER_VEHICLE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-white/80 mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        name={field.key}
        type={field.type}
        required={field.required}
        minLength={field.minLength}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={`${driverFieldClass}${field.dir === 'ltr' ? ' font-mono' : ''}`}
        dir={field.dir}
      />
    </div>
  )
}

export function DriversPage({ params, setParams }) {
  const [drivers, setDrivers] = useState([])
  const [paginationMeta, setPaginationMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')

  const [selectedDriver, setSelectedDriver] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [newDriver, setNewDriver] = useState(emptyDriverForm())
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [zones, setZones] = useState([])
  const [zonesLoading, setZonesLoading] = useState(false)
  const [zonesError, setZonesError] = useState('')

  const [deactivateReason, setDeactivateReason] = useState('')
  const [showDeactivateForm, setShowDeactivateForm] = useState(false)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const [chatDriver, setChatDriver] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (params?.driver_id) {
      const driverId = Number(params.driver_id)
      
      const fetchAndOpenChat = async () => {
        try {
          const data = await getDriver(driverId)
          const mapped = mapDriverDetail(data)
          openChat(mapped)
        } catch {
          openChat({ id: driverId, name: 'سائق', phone: '—' })
        }
      }
      
      fetchAndOpenChat()
      setParams?.(null)
    }
  }, [params, setParams])

  const loadSeq = useRef(0)

  const loadDrivers = useCallback(async () => {
    const seq = ++loadSeq.current
    const params = buildDriverQueryParams({
      status: activeStatus,
    })
    const data = await getDrivers(params)
    if (seq !== loadSeq.current) return
    const mapped = extractDriverList(data).map(mapDriver)
    setDrivers(
      applyDriverListFilters(mapped, {
        search: searchQuery,
        status: activeStatus,
      }),
    )
    setPaginationMeta(extractPaginationMeta(data))
  }, [searchQuery, activeStatus])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadDrivers()
      } catch (err) {
        setDrivers([])
        setPaginationMeta({})
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل قائمة السائقين.'))
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [loadDrivers])

  const stats = buildDriverStats(drivers, paginationMeta)

  const getStatusStyle = (status) => {
    switch (status) {
      case 'متاح': return 'bg-emerald-100 text-emerald-700'
      case 'في مهمة': return 'bg-yellow-100 text-yellow-700'
      case 'معطل': return 'bg-red-100 text-red-700'
      default: return 'bg-brand-300 text-white/80'
    }
  }

  const closeDetails = () => {
    setDetailsModalOpen(false)
    setSelectedDriver(null)
    setDeactivateReason('')
    setShowDeactivateForm(false)
    setToggleError('')
    setEditForm(null)
    setShowEditForm(false)
    setEditError('')
  }

  const openDetails = async (driver) => {
    setSelectedDriver(driver)
    setDetailsModalOpen(true)
    setDetailLoading(true)
    setDeactivateReason('')
    setShowDeactivateForm(false)
    setToggleError('')
    try {
      const mapped = await loadDriverAdminStats(driver.id)
      setSelectedDriver(mapped)
      setEditForm(emptyDriverEditForm(mapped))
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === mapped.id
            ? {
                ...d,
                deliveries: mapped.deliveries,
                totalEarnings: mapped.totalEarnings,
                custodyBalance: mapped.custodyBalance,
              }
            : d,
        ),
      )
      if (!zones.length) await loadZones()
    } catch (err) {
      setActionMessage(apiErrorMessage(err, 'تعذّر تحميل تفاصيل السائق.'))
      setTimeout(() => setActionMessage(''), 3000)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeAdd = () => {
    setAddModalOpen(false)
    setNewDriver(emptyDriverForm())
    setAddError('')
    setZonesError('')
  }

  const loadZones = useCallback(async () => {
    setZonesLoading(true)
    setZonesError('')
    try {
      setZones(await fetchAvailableZones())
    } catch (err) {
      setZones([])
      setZonesError(apiErrorMessage(err, 'تعذّر تحميل المناطق المتاحة من GET /api/zones.'))
    } finally {
      setZonesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadZones()
  }, [loadZones])

  const openAdd = async () => {
    setNewDriver(emptyDriverForm())
    setAddError('')
    setZonesError('')
    setAddModalOpen(true)
    await loadZones()
  }

  const updateDriverField = (key, value) => {
    setNewDriver((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddDriver = async (e) => {
    e.preventDefault()
    setAddError('')

    const validationErrors = validateCreateDriverForm(newDriver)
    const firstError = firstValidationError(validationErrors)
    if (firstError) {
      setAddError(firstError)
      return
    }

    setAddLoading(true)
    try {
      await createDriver(buildCreateDriverPayload(newDriver))
      closeAdd()
      setActionMessage('تم إضافة السائق بنجاح.')
      await loadDrivers()
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setAddError(apiErrorMessage(err, 'تعذّر إضافة السائق.'))
    } finally {
      setAddLoading(false)
    }
  }

  const openChat = (driver) => {
    setChatDriver(driver)
    setChatOpen(true)
  }

  const closeChat = () => {
    setChatOpen(false)
    setChatDriver(null)
  }

  const handleDriverCustodyUpdated = (patch) => {
    if (!selectedDriver) return
    const updated = { ...selectedDriver, ...patch }
    setSelectedDriver(updated)
    setDrivers((prev) =>
      prev.map((d) => (d.id === updated.id ? { ...d, ...patch } : d)),
    )
  }

  const handleUpdateDriver = async (e) => {
    e.preventDefault()
    if (!selectedDriver || !editForm) return
    const payload = buildUpdateDriverPayload(editForm)
    if (!Object.keys(payload).length) {
      setEditError('لم يتم تغيير أي حقل.')
      return
    }
    setEditLoading(true)
    setEditError('')
    try {
      await updateDriver(selectedDriver.id, payload)
      const mapped = await loadDriverAdminStats(selectedDriver.id)
      setSelectedDriver(mapped)
      setEditForm(emptyDriverEditForm(mapped))
      setShowEditForm(false)
      setActionMessage('تم تحديث بيانات السائق.')
      await loadDrivers()
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setEditError(apiErrorMessage(err, 'تعذّر تحديث بيانات السائق.'))
    } finally {
      setEditLoading(false)
    }
  }

  const handleToggleStatus = async (e) => {
    e.preventDefault()
    if (!selectedDriver) return

    setToggleLoading(true)
    setToggleError('')
    try {
      let result
      if (selectedDriver.rawStatus === 'active') {
        result = await deactivateDriver(selectedDriver.id, deactivateReason)
        setActionMessage(result?.message || 'تم تعطيل حساب السائق.')
      } else {
        result = await reactivateDriver(selectedDriver.id)
        setActionMessage(result?.message || 'تم إعادة تفعيل حساب السائق.')
      }

      const mapped = mapDriverDetail(result)
      setSelectedDriver(mapped)
      setEditForm(emptyDriverEditForm(mapped))
      setDeactivateReason('')
      setShowDeactivateForm(false)
      await loadDrivers()
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setToggleError(apiErrorMessage(err, 'تعذّر تحديث حالة السائق.'))
    } finally {
      setToggleLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">إدارة السائقين</h1>
          <p className="text-sm text-white/60">إدارة السائقين وعمليات التوصيل</p>
        </div>
        <PrimaryButton onClick={openAdd} className="shrink-0">
          <Plus className="size-5" strokeWidth={2.5} aria-hidden />
          إضافة سائق
        </PrimaryButton>
      </div>

      {actionMessage ? (
        <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {actionMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <Truck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي السائقين</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.total}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <UserCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">سائقون متاحون</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.available}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500">
            <Truck className="size-6 rotate-12" />
          </div>
          <p className="text-sm font-medium text-white/60">في مهمة توصيل</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.onTrip}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">معطلون</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.disabled}</p>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <select
          value={activeStatus}
          onChange={(e) => setActiveStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option>جميع الحالات</option>
          <option>متاح</option>
          <option>في مهمة</option>
          <option>معطل</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الهاتف أو المركبة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-brand-300 py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-brand-200 focus:border-brand-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm ">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 font-medium">الاسم</th>
                <th className="px-3 py-3 font-medium">الهاتف</th>
                <th className="px-3 py-3 font-medium">المركبة</th>
                <th className="px-3 py-3 font-medium text-center">التقييم</th>
                <th className="px-3 py-3 font-medium text-center">التوصيلات</th>
                <th className="px-3 py-3 font-medium text-center">الحالة</th>
                <th className="px-3 py-3 font-medium text-center">رسالة</th>
                <th className="px-3 py-3 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-3 py-12 text-center text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      جاري تحميل السائقين...
                    </span>
                  </td>
                </tr>
              ) : drivers.map((d) => (
                <tr key={d.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-bold text-white">{d.name}</td>
                  <td className="px-3 py-3 text-white/70 font-mono text-xs">{d.phone}</td>
                  <td className="px-3 py-3 text-white/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Truck className="size-3 text-white/50" />
                      {d.vehicle}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-white/80">{d.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-medium text-white/70">{d.deliveries}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-block shrink-0 px-3 py-1 rounded-full text-[11px] font-bold ${getStatusStyle(d.status)}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <PrimaryButton
                      type="button"
                      onClick={() => openChat(d)}
                      className="px-3 py-1.5 text-xs"
                      title="رسالة للسائق"
                      aria-label={`رسالة إلى ${d.name}`}
                    >
                      <MessageCircle className="size-3.5 shrink-0" />
                      رسالة
                    </PrimaryButton>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => openDetails(d)}
                      className="icon-btn-view"
                      title="عرض التفاصيل"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && drivers.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-white/60">
                    {loadError || 'لا يوجد سائقين مطابقين للبحث أو الفلتر.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-brand-300/50 text-left">
          <p className="text-sm text-white/60">
            عرض {drivers.length} من {stats.total} سائق
          </p>
        </div>
      </div>

      {detailsModalOpen && selectedDriver ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل السائق</h2>
              <button type="button" onClick={closeDetails} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-white/60">
                  <Loader2 className="size-6 animate-spin" />
                  <span>جاري تحميل التفاصيل...</span>
                </div>
              ) : (
              <>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusStyle(selectedDriver.status)}`}>
                    {selectedDriver.status}
                  </span>
                  <PrimaryButton
                    type="button"
                    onClick={() => openChat(selectedDriver)}
                    className="px-3 py-1.5 text-xs"
                  >
                    <MessageCircle className="size-3.5" />
                    رسالة
                  </PrimaryButton>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedDriver.name}</h3>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-white/70">{selectedDriver.rating.toFixed(1)} التقييم العام</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <Phone className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">رقم الهاتف</p>
                    <p className="font-bold text-white font-mono" dir="ltr">{selectedDriver.phone}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <Truck className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">المركبة</p>
                    <p className="font-bold text-white">{selectedDriver.vehicle}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <MapPin className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">إجمالي التوصيلات</p>
                    <p className="font-bold text-white">{selectedDriver.deliveries} طلب</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <Star className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">إجمالي الأرباح</p>
                    <p className="font-bold text-white" dir="ltr">
                      {Number(selectedDriver.totalEarnings ?? 0).toLocaleString('ar-LY')} د.ل
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white/80">تعديل البيانات</h3>
                {!showEditForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(true)
                      setEditError('')
                    }}
                    className="w-full rounded-xl border border-white/10 bg-brand-300 px-4 py-3 text-sm font-bold text-white/80 hover:bg-brand-100"
                  >
                    تعديل بيانات السائق
                  </button>
                ) : editForm ? (
                  <form className="space-y-4" onSubmit={handleUpdateDriver}>
                    {DRIVER_UPDATE_FIELDS.map((field) => (
                      <div key={field.key}>
                        <label className="mb-2 block text-sm font-medium text-white/80">{field.label}</label>
                        {field.type === 'vehicle_type' ? (
                          <select
                            value={editForm[field.key]}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className={driverFieldClass}
                          >
                            {DRIVER_VEHICLE_TYPES.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : field.type === 'zone' ? (
                          <select
                            value={editForm[field.key]}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className={driverFieldClass}
                          >
                            <option value="">اختر المنطقة</option>
                            {zones.map((zone) => (
                              <option key={zone.id} value={zone.id}>{zone.name}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={editForm[field.key]}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            className={driverFieldClass}
                            dir={field.dir}
                          />
                        )}
                      </div>
                    ))}
                    {editError ? (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{editError}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" disabled={editLoading} className="btn-primary disabled:opacity-60">
                        {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditForm(false)
                          setEditForm(emptyDriverEditForm(selectedDriver))
                          setEditError('')
                        }}
                        className="rounded-xl border border-white/10 bg-brand-300 px-5 py-2.5 text-sm font-bold text-white/80"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>

              <DriverCustodyViewSection
                driver={selectedDriver}
                onCustodyLoaded={(view) => {
                  setSelectedDriver((prev) =>
                    prev ? { ...prev, custodyView: view, custodyBalance: view.custodyBalance, pendingCash: view.pendingCash } : prev,
                  )
                }}
              />

              <DriverCustodySection
                driver={selectedDriver}
                custodyView={selectedDriver.custodyView}
                onDriverUpdated={handleDriverCustodyUpdated}
                onSettled={(view) => {
                  setSelectedDriver((prev) =>
                    prev ? { ...prev, custodyView: view, custodyBalance: view.custodyBalance, pendingCash: view.pendingCash } : prev,
                  )
                }}
                onMessage={(msg) => {
                  setActionMessage(msg)
                  setTimeout(() => setActionMessage(''), 4000)
                }}
                onError={(msg) => {
                  setActionMessage(msg)
                  setTimeout(() => setActionMessage(''), 4000)
                }}
              />

              <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-white/80">إدارة الحساب</h3>

                {selectedDriver.rawStatus === 'active' && !showDeactivateForm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeactivateForm(true)
                      setToggleError('')
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
                  >
                    <Ban className="size-4" />
                    تعطيل الحساب
                  </button>
                ) : null}

                {selectedDriver.rawStatus === 'active' && showDeactivateForm ? (
                  <form className="space-y-4" onSubmit={handleToggleStatus}>
                    <div>
                      <label htmlFor="driver-deactivate-reason" className="mb-2 block text-sm font-medium text-white/80">
                        سبب التعطيل (اختياري)
                      </label>
                      <textarea
                        id="driver-deactivate-reason"
                        value={deactivateReason}
                        onChange={(e) => setDeactivateReason(e.target.value)}
                        placeholder="اكتبي سبب تعطيل الحساب..."
                        rows={3}
                        className="input-brand resize-none"
                      />
                    </div>
                    {toggleError ? (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {toggleError}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="submit" disabled={toggleLoading} className="btn-primary disabled:opacity-60">
                        {toggleLoading ? 'جاري الحفظ...' : 'تأكيد التعطيل'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeactivateForm(false)
                          setDeactivateReason('')
                          setToggleError('')
                        }}
                        className="rounded-xl border border-white/10 bg-brand-300 px-5 py-2.5 text-sm font-bold text-white/80 transition-colors hover:bg-brand-100"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : null}

                {selectedDriver.rawStatus !== 'active' ? (
                  <form className="space-y-4" onSubmit={handleToggleStatus}>
                    <p className="text-sm text-white/70">هذا الحساب معطّل حالياً. يمكنك إعادة تفعيله.</p>
                    {toggleError ? (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {toggleError}
                      </p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={toggleLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {toggleLoading ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                      إعادة تفعيل الحساب
                    </button>
                  </form>
                ) : null}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {addModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto py-10 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col my-auto">

            <div className="flex shrink-0 items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">إضافة سائق جديد</h2>
              <button type="button" onClick={closeAdd} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto p-6 text-right">
                {DRIVER_CREATE_FIELDS.map((field) => (
                  <DriverCreateField
                    key={field.key}
                    field={field}
                    value={newDriver[field.key]}
                    onChange={updateDriverField}
                  zones={zones}
                  zonesLoading={zonesLoading}
                  zonesError={zonesError}
                  onReloadZones={loadZones}
                />
                ))}

                {addError ? (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {addError}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-3 border-t border-white/10 bg-brand-200 p-6">
                <PrimaryButton
                  type="submit"
                  disabled={addLoading}
                  className="flex-1"
                >
                  {addLoading ? 'جاري الإضافة...' : 'إضافة السائق'}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={closeAdd}
                  className="rounded-lg border border-white/10 bg-brand-200 px-8 py-3 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <DriverChatModal
        driver={chatDriver}
        open={chatOpen}
        onClose={closeChat}
      />

    </div>
  )
}

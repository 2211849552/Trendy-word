import { useState, useEffect, useCallback } from 'react'
import {
  MapPin,
  Plus,
  Trash2,
  X,
  Loader2,
} from 'lucide-react'
import {
  fetchZonesList,
  createZone,
  deleteZone,
  buildCreateZonePayload,
  validateCreateZoneForm,
  extractCreatedZone,
  saveZoneCity,
  removeZoneCity,
} from '../api/zones.js'
import { formatCityWithFlag } from '../data/libyanCities.js'
import { ConfirmDeleteModal } from '../components/catalog/ConfirmDeleteModal.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية إدارة المناطق.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function ZonesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newAddressName, setNewAddressName] = useState('')
  const [newAddressCity, setNewAddressCity] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadAddresses = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setAddresses(await fetchZonesList())
    } catch (err) {
      setAddresses([])
      setLoadError(apiErrorMessage(err, 'تعذّر تحميل قائمة المناطق.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  useEffect(() => {
    if (!actionMessage) return undefined
    const timer = setTimeout(() => setActionMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [actionMessage])

  const closeAdd = () => {
    setAddModalOpen(false)
    setNewAddressName('')
    setNewAddressCity('')
    setAddError('')
  }

  const openAdd = () => {
    setNewAddressName('')
    setNewAddressCity('')
    setAddError('')
    setAddModalOpen(true)
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setAddError('')

    const validationError = validateCreateZoneForm({
      name: newAddressName,
      city: newAddressCity,
    })
    if (validationError) {
      setAddError(validationError)
      return
    }

    setAddLoading(true)
    try {
      const result = await createZone(buildCreateZonePayload({
        name: newAddressName,
        city: newAddressCity,
      }))
      const created = extractCreatedZone(result)
      if (created?.id) {
        saveZoneCity(created.id, newAddressCity, newAddressName)
      }
      closeAdd()
      setActionMessage('تم إضافة المنطقة بنجاح.')
      await loadAddresses()
    } catch (err) {
      setAddError(apiErrorMessage(err, 'تعذّر إضافة المنطقة.'))
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteAddress = (address) => {
    setDeleteTarget(address)
  }

  const confirmDeleteAddress = async () => {
    if (!deleteTarget) return

    setDeleteLoading(true)
    try {
      await deleteZone(deleteTarget.id)
      removeZoneCity(deleteTarget.id, deleteTarget.name)
      setDeleteTarget(null)
      setActionMessage('تم حذف المنطقة بنجاح.')
      await loadAddresses()
    } catch (err) {
      setActionMessage(apiErrorMessage(err, 'تعذّر حذف المنطقة.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">إدارة المناطق</h1>
          <p className="text-sm text-white/60">عرض وإضافة وحذف المناطق المدعومة عبر API</p>
        </div>
        <PrimaryButton onClick={openAdd} className="shrink-0">
          <Plus className="size-5" strokeWidth={2.5} aria-hidden />
          إضافة منطقة
        </PrimaryButton>
      </div>

      {actionMessage ? (
        <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {actionMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <MapPin className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي المناطق</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : addresses.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">اسم المنطقة</th>
                <th className="px-3 py-3 font-medium">المدينة</th>
                <th className="px-3 py-3 font-medium">تاريخ الإضافة</th>
                <th className="px-3 py-3 font-medium text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-3 py-12 text-center text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      جاري تحميل المناطق...
                    </span>
                  </td>
                </tr>
              ) : addresses.map((address) => (
                <tr key={address.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-mono text-xs text-white/60">{address.id}</td>
                  <td className="px-3 py-3 font-bold text-white">{address.name}</td>
                  <td className="px-3 py-3 text-white/70">
                    {address.city ? formatCityWithFlag(address.city) : '—'}
                  </td>
                  <td className="px-3 py-3 text-white/60">{address.createdAt}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address)}
                      disabled={deleteLoading && deleteTarget?.id === address.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-60"
                      title="حذف المنطقة"
                    >
                      {deleteLoading && deleteTarget?.id === address.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && addresses.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-white/60">
                    {loadError || 'لا توجد مناطق مسجّلة.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-brand-300/50 text-left">
          <p className="text-sm text-white/60">
            عرض {addresses.length} {addresses.length === 1 ? 'منطقة' : 'مناطق'}
          </p>
        </div>
      </div>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="تأكيد حذف المنطقة"
        message={
          deleteTarget ? (
            <>
              أنت على وشك حذف منطقة{' '}
              <span className="font-bold text-white">«{deleteTarget.name}»</span> نهائياً.
              لا يمكن التراجع عن هذا الإجراء.
            </>
          ) : null
        }
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={confirmDeleteAddress}
        loading={deleteLoading}
      />

      {addModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">إضافة منطقة جديدة</h2>
              <button type="button" onClick={closeAdd} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-5 text-right">
              <div>
                <label htmlFor="address-name" className="block text-sm font-medium text-white/80 mb-1.5">
                  اسم المنطقة *
                </label>
                <input
                  id="address-name"
                  type="text"
                  required
                  placeholder="مثال: بن عاشور"
                  value={newAddressName}
                  onChange={(e) => setNewAddressName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-500"
                />
              </div>

              <div>
                <label htmlFor="address-city" className="block text-sm font-medium text-white/80 mb-1.5">
                  المدينة *
                </label>
                <input
                  id="address-city"
                  type="text"
                  required
                  placeholder="مثال: طرابلس"
                  value={newAddressCity}
                  onChange={(e) => setNewAddressCity(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-500"
                />
              </div>

              {addError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {addError}
                </p>
              ) : null}

              <div className="flex items-center gap-3 pt-2">
                <PrimaryButton
                  type="submit"
                  disabled={addLoading}
                  className="flex-1"
                >
                  {addLoading ? 'جاري الإضافة...' : 'إضافة المنطقة'}
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
    </div>
  )
}

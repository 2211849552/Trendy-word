import { useState, useEffect, useCallback } from 'react'
import { StoreJoinRequestsView } from '../components/stores/StoreJoinRequestsView.jsx'
import { StoreListView } from '../components/stores/StoreListView.jsx'
import {
  getStoreRequests,
  getStoreRequest,
  acceptStoreRequest,
  rejectStoreRequest,
  mapJoinRequest,
} from '../api/storeRequests.js'
import {
  getAdminStores,
  getAdminStore,
  printAdminStores,
  deactivateAdminStore,
  reactivateAdminStore,
  updateAdminStore,
  updateStoreDeliveryPrices,
  settleStoreCustody,
  extractStoreList,
  mapAdminStore,
  mapAdminStoreDetail,
  toApiStoreStatus,
} from '../api/adminStores.js'
import {
  hasFullStoreManagementAccess,
  canViewStorePromotions,
} from '../api/user.js'

function extractList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

async function enrichMissingMerchantData(stores, setStores) {
  if (!stores?.length || typeof setStores !== 'function') return
  const needsDetail = stores.filter(
    (s) =>
      (s.merchant === '—' || s.email === '—') && s.id != null && String(s.id) !== '',
  )
  if (!needsDetail.length) return

  const updates = await Promise.all(
    needsDetail.map(async (store) => {
      try {
        const data = await getAdminStore(store.id)
        const detail = mapAdminStoreDetail(data)
        return {
          id: store.id,
          merchant: detail.merchant !== '—' ? detail.merchant : null,
          email: detail.email !== '—' ? detail.email : null,
          phone: detail.phone !== '—' ? detail.phone : null,
        }
      } catch {
        return null
      }
    }),
  )

  setStores((prev) => {
    const map = new Map()
    updates.forEach((u) => {
      if (u) map.set(String(u.id), u)
    })
    if (map.size === 0) return prev
    return prev.map((s) => {
      const u = map.get(String(s.id))
      if (!u) return s
      return {
        ...s,
        merchant: u.merchant ?? s.merchant,
        email: u.email ?? s.email,
        phone: u.phone ?? s.phone,
      }
    })
  })
}

export function StoreManagementPage({ params, setParams, currentUser }) {
  const [view, setView] = useState('join')
  const [joinRequests, setJoinRequests] = useState([])
  const [registeredStores, setRegisteredStores] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [storesLoading, setStoresLoading] = useState(false)
  const [storesError, setStoresError] = useState('')
  const [storeQuery, setStoreQuery] = useState('')
  const [storeStatus, setStoreStatus] = useState('all')
  const canAccessAdvancedStoreFeatures = hasFullStoreManagementAccess(currentUser)
  const canEditDeliveryPrices = hasFullStoreManagementAccess(currentUser)
  const canViewStorePromotionsAccess = canViewStorePromotions(currentUser)

  useEffect(() => {
    if (params?.store_join_request_id) {
      setView('join')
    }
  }, [params])

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true)
    try {
      const data = await getStoreRequests({ status: 'pending' })
      setJoinRequests(extractList(data).map(mapJoinRequest))
    } catch {
      setJoinRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }, [])

  const loadStores = useCallback(async (query = storeQuery, status = storeStatus) => {
    setStoresLoading(true)
    setStoresError('')
    try {
      const params = {}
      const trimmed = query.trim()
      if (trimmed) params.name = trimmed
      const apiStatus = toApiStoreStatus(status)
      if (apiStatus) params.status = apiStatus

      const data = await getAdminStores(params)
      const mappedStores = extractStoreList(data).map(mapAdminStore)
      setRegisteredStores(mappedStores)
      enrichMissingMerchantData(mappedStores, setRegisteredStores)
    } catch (err) {
      setRegisteredStores([])
      if (err?.status === 401) {
        setStoresError('انتهت الجلسة. سجّلي الدخول من جديد.')
      } else if (err?.status === 403) {
        setStoresError('ليس لديك صلاحية عرض المتاجر.')
      } else {
        setStoresError(err?.message || 'تعذّر تحميل قائمة المتاجر.')
      }
    } finally {
      setStoresLoading(false)
    }
  }, [storeQuery, storeStatus])

  useEffect(() => {
    loadRequests()
    getAdminStores({ per_page: 100 })
      .then((data) => {
        const mappedStores = extractStoreList(data).map(mapAdminStore)
        setRegisteredStores(mappedStores)
        enrichMissingMerchantData(mappedStores, setRegisteredStores)
      })
      .catch(() => {})
  }, [loadRequests])

  useEffect(() => {
    if (view !== 'list') return undefined

    const timer = setTimeout(() => {
      loadStores(storeQuery, storeStatus)
    }, 300)

    return () => clearTimeout(timer)
  }, [view, storeQuery, storeStatus, loadStores])

  const handleLoadRequestDetails = async (requestId) => {
    try {
      const data = await getStoreRequest(requestId)
      const mapped = mapJoinRequest(data?.data ?? data)
      setJoinRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...mapped } : r)),
      )
      return mapped
    } catch {
      return joinRequests.find((r) => r.id === requestId) ?? null
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptStoreRequest(requestId)
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId))
      if (view === 'list') await loadStores()
    } catch {
      // keep request in list if API fails
    }
  }

  const handleRejectRequest = async (requestId, reason) => {
    try {
      await rejectStoreRequest(requestId, { reason })
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      // keep request in list if API fails
    }
  }

  const handleLoadStoreDetails = async (storeId) => {
    try {
      const data = await getAdminStore(storeId)
      return mapAdminStoreDetail(data)
    } catch {
      return registeredStores.find((s) => s.id === storeId) ?? null
    }
  }

  const handleToggleStoreStatus = async (store, reason) => {
    if (store.status === 'active') {
      await deactivateAdminStore(store.id, { reason })
    } else {
      await reactivateAdminStore(store.id)
    }
    await loadStores()
  }

  const handleUpdateStore = async (storeId, payload) => {
    const data = await updateAdminStore(storeId, payload)
    const updated = mapAdminStoreDetail(data)
    setRegisteredStores((prev) =>
      prev.map((s) => (String(s.id) === String(storeId) ? { ...s, ...updated } : s)),
    )
    return updated
  }

  const handleUpdateDeliveryPrices = async (storeId, deliveryPrices) => {
    const data = await updateStoreDeliveryPrices(storeId, deliveryPrices)
    const updated = mapAdminStoreDetail(data)
    setRegisteredStores((prev) =>
      prev.map((s) => (String(s.id) === String(storeId) ? { ...s, ...updated } : s)),
    )
    return updated
  }

  const handleSettleCustody = async (storeId) => {
    const result = await settleStoreCustody(storeId)
    await loadStores()
    return result
  }

  const handlePrintStores = async () => {
    const params = {}
    const trimmed = storeQuery.trim()
    if (trimmed) params.name = trimmed
    const apiStatus = toApiStoreStatus(storeStatus)
    if (apiStatus) params.status = apiStatus

    const data = await printAdminStores(params)
    return extractStoreList(data).map(mapAdminStore)
  }

  if (view === 'list') {
    return (
      <StoreListView
        stores={registeredStores}
        loading={storesLoading}
        loadError={storesError}
        query={storeQuery}
        status={storeStatus}
        onQueryChange={setStoreQuery}
        onStatusChange={setStoreStatus}
        onToggleStoreStatus={handleToggleStoreStatus}
        onLoadStoreDetails={handleLoadStoreDetails}
        onUpdateStore={handleUpdateStore}
        onSettleCustody={canAccessAdvancedStoreFeatures ? handleSettleCustody : undefined}
        onPrintStores={handlePrintStores}
        canEditDeliveryPrices={canEditDeliveryPrices}
        canViewStoreProducts={canAccessAdvancedStoreFeatures}
        canViewStorePromotions={canViewStorePromotionsAccess}
        onBackToJoin={() => setView('join')}
      />
    )
  }

  return (
    <StoreJoinRequestsView
      requests={joinRequests}
      registeredStores={registeredStores}
      loading={loadingRequests}
      onAccept={handleAcceptRequest}
      onReject={handleRejectRequest}
      onLoadRequest={handleLoadRequestDetails}
      onOpenList={() => setView('list')}
      initialRequestId={params?.store_join_request_id}
      onClearInitialRequestId={() => setParams?.(null)}
    />
  )
}

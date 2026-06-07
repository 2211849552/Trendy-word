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
  extractStoreList,
  mapAdminStore,
  mapAdminStoreDetail,
  toApiStoreStatus,
} from '../api/adminStores.js'

function extractList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function StoreManagementPage() {
  const [view, setView] = useState('join')
  const [joinRequests, setJoinRequests] = useState([])
  const [registeredStores, setRegisteredStores] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [storesLoading, setStoresLoading] = useState(false)
  const [storesError, setStoresError] = useState('')
  const [storeQuery, setStoreQuery] = useState('')
  const [storeStatus, setStoreStatus] = useState('all')

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
      setRegisteredStores(extractStoreList(data).map(mapAdminStore))
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
      .then((data) => setRegisteredStores(extractStoreList(data).map(mapAdminStore)))
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
        onPrintStores={handlePrintStores}
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
    />
  )
}

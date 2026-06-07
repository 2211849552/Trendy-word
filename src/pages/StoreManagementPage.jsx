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
import { joinRequests as initialJoinRequests, registeredStores as initialRegisteredStores } from '../data/stores.js'

function extractList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function StoreManagementPage() {
  const [view, setView] = useState('join')
  const [joinRequests, setJoinRequests] = useState(initialJoinRequests)
  const [registeredStores, setRegisteredStores] = useState(initialRegisteredStores)
  const [loadingRequests, setLoadingRequests] = useState(true)

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true)
    try {
      const data = await getStoreRequests({ status: 'pending' })
      setJoinRequests(extractList(data).map(mapJoinRequest))
    } catch {
      setJoinRequests(initialJoinRequests)
    } finally {
      setLoadingRequests(false)
    }
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

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
    const request = joinRequests.find((r) => r.id === requestId)
    if (!request) return

    try {
      await acceptStoreRequest(requestId)
    } catch {
      return
    }

    const newStore = {
      id: `r${Date.now()}`,
      name: request.storeName,
      city: request.city,
      merchant: request.owner,
      email: request.email,
      phone: request.phone,
      products: 0,
      orders: 0,
      icon: 'shirt',
      status: 'pending',
      catalog: [],
    }

    setRegisteredStores((prev) => [newStore, ...prev])
    setJoinRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  const handleRejectRequest = async (requestId, reason) => {
    try {
      await rejectStoreRequest(requestId, { reason })
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      // keep request in list if API fails
    }
  }

  const handleToggleStoreStatus = (storeId) => {
    setRegisteredStores((prev) =>
      prev.map((s) =>
        s.id === storeId ? { ...s, status: s.status === 'active' ? 'disabled' : 'active' } : s,
      ),
    )
  }

  if (view === 'list') {
    return (
      <StoreListView
        stores={registeredStores}
        onToggleStoreStatus={handleToggleStoreStatus}
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

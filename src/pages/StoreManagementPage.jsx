import { useState } from 'react'
import { StoreJoinRequestsView } from '../components/stores/StoreJoinRequestsView.jsx'
import { StoreListView } from '../components/stores/StoreListView.jsx'
import { joinRequests as initialJoinRequests, registeredStores as initialRegisteredStores } from '../data/stores.js'

export function StoreManagementPage() {
  const [view, setView] = useState('join') // 'join', 'list'
  const [joinRequests, setJoinRequests] = useState(initialJoinRequests)
  const [registeredStores, setRegisteredStores] = useState(initialRegisteredStores)

  const handleAcceptRequest = (requestId) => {
    const request = joinRequests.find(r => r.id === requestId)
    if (!request) return

    // Create a new store object from the request
    const newStore = {
      id: `r${Date.now()}`,
      name: request.storeName,
      city: request.city,
      merchant: request.owner,
      email: request.email,
      phone: request.phone,
      products: 0,
      orders: 0,
      icon: 'shirt', // Default icon
      status: 'active',
      catalog: []
    }

    setRegisteredStores(prev => [newStore, ...prev])
    setJoinRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const handleRejectRequest = (requestId) => {
    setJoinRequests(prev => prev.filter(r => r.id !== requestId))
  }

  const handleDeleteStore = (storeId) => {
    setRegisteredStores(prev => prev.filter(s => s.id !== storeId))
  }

  if (view === 'list') {
    return (
      <StoreListView 
        stores={registeredStores}
        onDeleteStore={handleDeleteStore}
        onBackToJoin={() => setView('join')} 
      />
    )
  }

  return (
    <StoreJoinRequestsView 
      requests={joinRequests}
      registeredStores={registeredStores}
      onAccept={handleAcceptRequest}
      onReject={handleRejectRequest}
      onOpenList={() => setView('list')} 
    />
  )
}

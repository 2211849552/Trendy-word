import { useState } from 'react'
import { StoreJoinRequestsView } from '../components/stores/StoreJoinRequestsView.jsx'
import { StoreListView } from '../components/stores/StoreListView.jsx'
import { StoreProductsView } from '../components/stores/StoreProductsView.jsx'

export function StoreManagementPage() {
  const [view, setView] = useState('join') // 'join', 'list', 'products'
  const [activeStoreId, setActiveStoreId] = useState(null)

  if (view === 'products') {
    return <StoreProductsView storeId={activeStoreId} onBack={() => setView('list')} />
  }

  if (view === 'list') {
    return (
      <StoreListView 
        onBackToJoin={() => setView('join')} 
        onOpenProducts={(id) => {
          setActiveStoreId(id)
          setView('products')
        }} 
      />
    )
  }

  return <StoreJoinRequestsView onOpenList={() => setView('list')} />
}

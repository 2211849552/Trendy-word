import { useState } from 'react'
import { StoreJoinRequestsView } from '../components/stores/StoreJoinRequestsView.jsx'
import { StoreListView } from '../components/stores/StoreListView.jsx'

export function StoreManagementPage() {
  const [view, setView] = useState('join') // 'join', 'list'

  if (view === 'list') {
    return (
      <StoreListView 
        onBackToJoin={() => setView('join')} 
      />
    )
  }

  return <StoreJoinRequestsView onOpenList={() => setView('list')} />
}

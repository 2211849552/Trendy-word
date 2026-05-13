import { useState } from 'react'
import { StoreJoinRequestsView } from '../components/stores/StoreJoinRequestsView.jsx'
import { StoreDetailView } from '../components/stores/StoreDetailView.jsx'
import { StoreListView } from '../components/stores/StoreListView.jsx'

export function StoreManagementPage() {
  const [listMode, setListMode] = useState(false)
  const [detailId, setDetailId] = useState(null)

  if (detailId) {
    return (
      <StoreDetailView
        requestId={detailId}
        onBack={() => setDetailId(null)}
      />
    )
  }

  if (listMode) {
    return <StoreListView onBackToJoin={() => setListMode(false)} />
  }

  return (
    <StoreJoinRequestsView
      onViewStore={(id) => setDetailId(id)}
      onOpenList={() => setListMode(true)}
    />
  )
}

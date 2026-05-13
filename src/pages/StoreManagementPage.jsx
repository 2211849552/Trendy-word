import { useState } from 'react'
import { StoreJoinRequestsView } from '../components/stores/StoreJoinRequestsView.jsx'
import { StoreListView } from '../components/stores/StoreListView.jsx'

export function StoreManagementPage() {
  const [listMode, setListMode] = useState(false)

  if (listMode) {
    return <StoreListView onBackToJoin={() => setListMode(false)} />
  }

  return <StoreJoinRequestsView onOpenList={() => setListMode(true)} />
}

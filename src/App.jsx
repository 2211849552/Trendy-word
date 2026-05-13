import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { StoreManagementPage } from './pages/StoreManagementPage.jsx'
import { MarketingPage } from './pages/MarketingPage.jsx'

export default function App() {
  const [activeNav, setActiveNav] = useState('overview')

  let content = <OverviewPage />
  if (activeNav === 'stores') content = <StoreManagementPage />
  else if (activeNav === 'marketing') content = <MarketingPage />

  return (
    <div className="flex min-h-dvh flex-row bg-slate-100" dir="ltr">
      <main dir="rtl" className="min-w-0 flex-1 overflow-auto px-6 py-8 lg:px-10">
        {content}
      </main>

      <Sidebar activeId={activeNav} onNavigate={setActiveNav} />
    </div>
  )
}

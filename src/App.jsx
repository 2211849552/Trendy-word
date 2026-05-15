import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { MarketingPage } from './pages/MarketingPage.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { PlansPage } from './pages/PlansPage.jsx'
import { StoreManagementPage } from './pages/StoreManagementPage.jsx'

function renderPage(activeNav) {
  if (activeNav === 'stores') return <StoreManagementPage />
  if (activeNav === 'plans') return <PlansPage />
  if (activeNav === 'marketing') return <MarketingPage />
  return <OverviewPage />
}

export default function App() {
  const [activeNav, setActiveNav] = useState('overview')

  return (
    <div className="flex min-h-dvh flex-row bg-slate-100" dir="ltr">
      <main dir="rtl" className="min-w-0 flex-1 overflow-auto px-6 py-8 lg:px-10">
        {renderPage(activeNav)}
      </main>

      <Sidebar activeId={activeNav} onNavigate={setActiveNav} />
    </div>
  )
}

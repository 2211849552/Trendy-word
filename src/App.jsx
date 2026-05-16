import { useState } from 'react'
import { Sidebar } from './components/Sidebar.jsx'
import { MarketingPage } from './pages/MarketingPage.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { PlansPage } from './pages/PlansPage.jsx'
import { StoreManagementPage } from './pages/StoreManagementPage.jsx'
import { CategoriesPage } from './pages/CategoriesPage.jsx'
import { DisputesPage } from './pages/DisputesPage.jsx'
import { FinancePage } from './pages/FinancePage.jsx'
import { OffersPage } from './pages/OffersPage.jsx'
import { CustomersPage } from './pages/CustomersPage.jsx'
import { StaffPage } from './pages/StaffPage.jsx'
import { NotificationsPage } from './pages/NotificationsPage.jsx'

function renderPage(activeNav) {
  if (activeNav === 'stores') return <StoreManagementPage />
  if (activeNav === 'plans') return <PlansPage />
  if (activeNav === 'marketing') return <MarketingPage />
  if (activeNav === 'catalog') return <CategoriesPage />
  if (activeNav === 'disputes') return <DisputesPage />
  if (activeNav === 'finance') return <FinancePage />
  if (activeNav === 'offers') return <OffersPage />
  if (activeNav === 'customers') return <CustomersPage />
  if (activeNav === 'staff') return <StaffPage />
  if (activeNav === 'notifications') return <NotificationsPage />
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

import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Users,
  Store,
  UserPlus,
} from 'lucide-react'
import { StatCard } from '../components/StatCard.jsx'
import { OrderStatusBarCard } from '../components/OrderStatusBarCard.jsx'
import { fetchOverviewStats, formatDashboardNumber } from '../api/adminDashboard.js'
import { getOrders, extractOrderList, mapOrder, buildOrderStats } from '../api/adminOrders.js'


export function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    stores: null,
    customers: null,
    staff: null,
    totalNewOrders: null,
  })
  const [loadError, setLoadError] = useState('')

  const [orderStats, setOrderStats] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const data = await fetchOverviewStats()
        if (cancelled) return
        setStats({
          stores: data.stores,
          customers: data.customers,
          staff: data.staff,
          totalNewOrders: data.totalNewOrders,
        })

        const failed = Object.values(data.errors).filter(Boolean)
        if (
          failed.length > 0 &&
          data.stores == null &&
          data.customers == null &&
          data.staff == null
        ) {
          setLoadError('تعذّر تحميل إحصائيات لوحة التحكم.')
        }
      } catch {
        if (!cancelled) {
          setLoadError('تعذّر تحميل إحصائيات لوحة التحكم.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    async function loadCharts() {
      try {
        let page = 1
        let allOrders = []
        let hasMore = true

        while (hasMore) {
          const ordersData = await getOrders({ per_page: 100, page })
          if (cancelled) return

          const ordersList = extractOrderList(ordersData)
          const mapped = ordersList.map(mapOrder)
          allOrders = [...allOrders, ...mapped]

          const meta = ordersData?.meta ?? {}
          const totalPages = meta.total_pages ?? 1
          if (page >= totalPages || ordersList.length === 0) {
            hasMore = false
          } else {
            page++
          }
        }

        setOrderStats(buildOrderStats(allOrders))
      } catch {
        // silently ignore chart errors so main stats still show
      }
    }

    load()
    loadCharts()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
          نظرة عامة
        </h1>
        <p className="mt-1 text-white/60">ملخص شامل لأداء المنصة</p>
      </header>

      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="ltr">
        <StatCard
          label="إجمالي المتاجر"
          value={loading ? '...' : stats.stores != null ? formatDashboardNumber(stats.stores) : '—'}
          change="—"
          icon={Store}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
        <StatCard
          label="إجمالي الموظفين"
          value={loading ? '...' : stats.staff != null ? formatDashboardNumber(stats.staff) : '—'}
          change="—"
          icon={UserPlus}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
        <StatCard
          label="إجمالي الزبائن"
          value={loading ? '...' : stats.customers != null ? formatDashboardNumber(stats.customers) : '—'}
          change="—"
          icon={Users}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
        <StatCard
          label="إجمالي الطلبات الجديدة"
          value={loading ? '...' : stats.totalNewOrders != null ? formatDashboardNumber(stats.totalNewOrders) : '—'}
          change="—"
          icon={ShoppingCart}
          iconClassName="bg-brand-300 text-white"
          omitChange
        />
      </div>


      <div className="mt-8">
        <OrderStatusBarCard stats={orderStats} />
      </div>
    </>
  )
}

import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Package,
  TrendingUp,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react'
import { StatCard } from '../components/StatCard.jsx'
import { PieChartCard } from '../components/PieChartCard.jsx'
import { LineChartCard } from '../components/LineChartCard.jsx'
import { OrderStatusBarCard } from '../components/OrderStatusBarCard.jsx'
import { KpiMiniCard } from '../components/KpiMiniCard.jsx'

export function OverviewPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          نظرة عامة
        </h1>
        <p className="mt-1 text-slate-500">ملخص شامل لأداء المنصة</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="ltr">
        <StatCard
          label="الإيرادات (د.ل)"
          value="67,000"
          change="22%"
          trend="up"
          icon={DollarSign}
          iconClassName="bg-brand-100 text-brand-800"
        />
        <StatCard
          label="الطلبات الشهرية"
          value="1,127"
          change="18%"
          trend="up"
          icon={ShoppingCart}
          iconClassName="bg-brand-100 text-brand-950"
        />
        <StatCard
          label="إجمالي الزبائن"
          value="12,847"
          change="9%"
          trend="up"
          icon={Users}
          iconClassName="bg-brand-100 text-brand-800"
        />
        <StatCard
          label="إجمالي المتاجر"
          value="245"
          change="5%"
          trend="up"
          icon={Store}
          iconClassName="bg-brand-100 text-brand-800"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LineChartCard />
        <PieChartCard />
      </div>

      <div className="mt-8 space-y-6">
        <OrderStatusBarCard />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiMiniCard
            label="المنتجات النشطة"
            value="8,456"
            icon={Package}
            iconWrapClassName="bg-brand-100 text-brand-950"
          />
          <KpiMiniCard
            label="الحملات النشطة"
            value="23"
            icon={TrendingUp}
            iconWrapClassName="bg-brand-100 text-brand-800"
          />
          <KpiMiniCard
            label="الشكاوى المفتوحة"
            value="15"
            icon={AlertCircle}
            iconWrapClassName="bg-rose-100 text-rose-600"
          />
          <KpiMiniCard
            label="العروض النشطة"
            value="34"
            icon={BadgeCheck}
            iconWrapClassName="bg-violet-100 text-violet-600"
          />
        </div>
      </div>
    </>
  )
}

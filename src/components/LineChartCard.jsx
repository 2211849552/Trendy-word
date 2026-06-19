import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_LINE_ORDERS, CHART_LINE_REVENUE } from '../theme/chartColors.js'

const DEFAULT_MONTHLY = [
  { month: 'يناير', revenue: 0, orders: 0 },
  { month: 'فبراير', revenue: 0, orders: 0 },
  { month: 'مارس', revenue: 0, orders: 0 },
  { month: 'إبريل', revenue: 0, orders: 0 },
  { month: 'مايو', revenue: 0, orders: 0 },
  { month: 'يونيو', revenue: 0, orders: 0 },
]

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap justify-center gap-4 pt-4">
      {payload.map((entry, index) => {
        const label = entry.value === 'revenue' ? 'الإيرادات' : 'الطلبات'
        return (
          <li key={`item-${index}`} className="flex items-center gap-1.5 text-sm font-bold text-white">
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {label}
          </li>
        )
      })}
    </ul>
  )
}

export function LineChartCard({ monthlyData = [] }) {
  const data = monthlyData.length > 0 ? monthlyData : DEFAULT_MONTHLY

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const maxOrders = Math.max(...data.map((d) => d.orders), 1)

  const revDomainMax = Math.ceil(maxRevenue / 10000) * 10000 || 80000
  const ordDomainMax = Math.ceil(maxOrders / 100) * 100 || 1500

  return (
    <section className="rounded-2xl bg-brand-200 p-6 shadow-premium border border-brand-100/50" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">الإيرادات والطلبات الشهرية</h2>
        <div className="flex gap-2">
          <span className="rounded-lg bg-brand-100 px-3 py-1 text-xs font-bold text-white">آخر 6 أشهر</span>
        </div>
      </div>

      <div className="h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="rev"
              orientation="left"
              tick={{ fill: '#64748b', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, revDomainMax]}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <YAxis
              yAxisId="ord"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, ordDomainMax]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Cairo, sans-serif',
                padding: '12px',
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `${Number(value).toLocaleString('ar-LY')} د.ل` : value,
                name === 'revenue' ? 'الإيرادات' : 'الطلبات',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              content={<CustomLegend />}
            />
            <Line
              yAxisId="rev"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke={CHART_LINE_REVENUE}
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_LINE_REVENUE, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              yAxisId="ord"
              type="monotone"
              dataKey="orders"
              name="orders"
              stroke={CHART_LINE_ORDERS}
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_LINE_ORDERS, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

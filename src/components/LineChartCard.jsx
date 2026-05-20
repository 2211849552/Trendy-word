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

const monthly = [
  { month: 'يناير', revenue: 42000, orders: 820 },
  { month: 'فبراير', revenue: 48000, orders: 910 },
  { month: 'مارس', revenue: 52000, orders: 980 },
  { month: 'إبريل', revenue: 61000, orders: 1050 },
  { month: 'مايو', revenue: 58000, orders: 1090 },
  { month: 'يونيو', revenue: 67000, orders: 1127 },
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

export function LineChartCard() {
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
          <LineChart data={monthly} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#ffffff', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="rev"
              orientation="left"
              tick={{ fill: '#ffffff', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 80000]}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <YAxis
              yAxisId="ord"
              orientation="right"
              tick={{ fill: '#ffffff', fontSize: 13, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 1500]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Cairo, sans-serif',
                padding: '12px'
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

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CAMPAIGN_METRICS, CHART_DISTRIBUTION_COLORS } from '../theme/chartColors.js'

const COLORS = CHART_DISTRIBUTION_COLORS

const legendColors = {
  نشطة: CAMPAIGN_METRICS.views.stroke,
  'قيد المراجعة': CAMPAIGN_METRICS.stores.stroke,
  موقوفة: CAMPAIGN_METRICS.products.stroke,
}

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RAD = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RAD)
  const y = cy + radius * Math.sin(-midAngle * RAD)

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-1.5 text-sm font-bold text-white">
          <span
            className="inline-block size-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  )
}

export function PieChartCard({ stores = [] }) {
  const activeCount = stores.filter((s) => s.status === 'active').length
  const pendingCount = stores.filter((s) => s.status === 'pending').length
  const disabledCount = stores.filter((s) => s.status === 'disabled').length

  const pieData = [
    { name: 'نشطة', value: activeCount },
    { name: 'قيد المراجعة', value: pendingCount },
    { name: 'موقوفة', value: disabledCount },
  ].filter((d) => d.value > 0)

  const hasData = pieData.length > 0

  return (
    <section className="rounded-2xl bg-brand-200 p-6 shadow-premium border border-brand-100/50" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">توزيع المتاجر</h2>
      </div>

      <div className="h-[280px] w-full" dir="ltr">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={pieData[i].name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v}%`, 'النسبة']}
                contentStyle={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'Cairo, sans-serif',
                  padding: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                content={<CustomLegend />}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/50">
            لا توجد بيانات كافية
          </div>
        )}
      </div>
    </section>
  )
}

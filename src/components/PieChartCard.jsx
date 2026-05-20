import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CAMPAIGN_METRICS, CHART_DISTRIBUTION_COLORS } from '../theme/chartColors.js'

const COLORS = CHART_DISTRIBUTION_COLORS

const legendColors = {
  نشطة: CAMPAIGN_METRICS.views.stroke,
  'قيد المراجعة': CAMPAIGN_METRICS.stores.stroke,
  موقوفة: CAMPAIGN_METRICS.products.stroke,
}

const pieData = [
  { name: 'نشطة', value: 84 },
  { name: 'قيد المراجعة', value: 12 },
  { name: 'موقوفة', value: 4 },
]

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
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

export function PieChartCard() {
  return (
    <section className="rounded-2xl bg-brand-200 p-6 shadow-premium border border-brand-100/50" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">توزيع المتاجر</h2>
      </div>
      
      <div className="h-[280px] w-full" dir="ltr">
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
                padding: '12px'
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              formatter={(value) => (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 ml-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: legendColors[value] ?? '#64748b' }}
                  />
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

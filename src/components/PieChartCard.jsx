import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#22c55e', '#fb923c', '#ef4444']

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
      fill="#334155"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function PieChartCard() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-slate-900">توزيع المتاجر</h2>
      <div className="mt-4 h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              innerRadius={68}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((_, i) => (
                <Cell key={pieData[i].name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`${v}%`, 'النسبة']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontFamily: 'Cairo, sans-serif',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

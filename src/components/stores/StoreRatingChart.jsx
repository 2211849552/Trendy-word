import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { storeRatings } from '../../data/stores.js'

export function StoreRatingChart() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-slate-900">
        أفضل المتاجر أداءً (حسب التقييم)
      </h2>
      <div className="mt-4 h-[260px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={storeRatings} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              interval={0}
              angle={-12}
              textAnchor="end"
              height={56}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 2, 5]}
              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontFamily: 'Cairo, sans-serif',
              }}
              formatter={(v) => [v, 'التقييم']}
            />
            <Bar dataKey="rating" fill="#f97316" radius={[8, 8, 0, 0]} maxBarSize={48} name="التقييم" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="size-3 shrink-0 rounded-sm bg-orange-500" aria-hidden />
          التقييم
        </div>
      </div>
    </section>
  )
}

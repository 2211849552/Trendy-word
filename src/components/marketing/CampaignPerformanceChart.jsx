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
import { campaignPerformanceSeries } from '../../data/campaigns.js'
import { CAMPAIGN_METRICS } from '../../theme/chartColors.js'

export function CampaignPerformanceChart() {
  return (
    <section className="rounded-2xl bg-brand-200 p-6 shadow-premium ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-white">أداء الحملات الإعلانية</h2>
      <div className="mt-4 h-[300px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={campaignPerformanceSeries}
            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              interval={0}
              height={48}
            />
            <YAxis
              yAxisId="views"
              orientation="left"
              domain={[0, 26000]}
              ticks={[0, 6500, 13000, 19500, 26000]}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              domain={[0, 120]}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontFamily: 'Cairo, sans-serif',
              }}
              formatter={(value, name) => {
                const labels = { views: 'المشاهدات', products: 'عدد المنتجات', stores: 'عدد المتاجر' }
                return [value, labels[name] ?? name]
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              formatter={(value) => {
                const map = {
                  stores: { label: 'عدد المتاجر', color: CAMPAIGN_METRICS.stores.stroke },
                  products: { label: 'عدد المنتجات', color: CAMPAIGN_METRICS.products.stroke },
                  views: { label: 'المشاهدات', color: CAMPAIGN_METRICS.views.stroke },
                }
                const item = map[value]
                if (!item) return value
                return (
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                )
              }}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="stores"
              name="stores"
              stroke={CAMPAIGN_METRICS.stores.stroke}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CAMPAIGN_METRICS.stores.stroke }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="count"
              type="monotone"
              dataKey="products"
              name="products"
              stroke={CAMPAIGN_METRICS.products.stroke}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CAMPAIGN_METRICS.products.stroke }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="views"
              type="monotone"
              dataKey="views"
              name="views"
              stroke={CAMPAIGN_METRICS.views.stroke}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CAMPAIGN_METRICS.views.stroke }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

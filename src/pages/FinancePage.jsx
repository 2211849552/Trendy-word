import { useState, useEffect } from 'react'
import { Download, Search, DollarSign, CheckCircle2, AlertCircle, BarChart2, Eye, X, CreditCard, Banknote } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import {
  getAdProfits,
  getSubscriptionProfits,
  getDeliveryProfits,
  getPlatformEarnings,
} from '../api/adminFinance.js'

const monthlyRevenueData = [
  { name: 'يناير', value: 45000 },
  { name: 'فبراير', value: 52000 },
  { name: 'مارس', value: 48000 },
  { name: 'أبريل', value: 61000 },
  { name: 'مايو', value: 55000 },
  { name: 'يونيو', value: 68000 },
]

const paymentMethodsData = [
  { name: 'محفظة إلكترونية', value: 67, color: '#334155' },
  { name: 'نقدي', value: 33, color: '#10b981' },
]

const dummyTransactions = [
  {
    id: 'ORD-001',
    customer: 'علي حسن',
    store: 'متجر الأزياء العصرية',
    amount: 360,
    type: 'محفظة إلكترونية',
    date: '2026-05-02',
    status: 'معلقة'
  },
  {
    id: 'ORD-002',
    customer: 'منى سالم',
    store: 'متجر الإلكترونيات الذكية',
    amount: 2500,
    type: 'نقدي',
    date: '2026-05-01',
    status: 'معلقة'
  },
  {
    id: 'ORD-003',
    customer: 'يوسف أحمد',
    store: 'متجر الأحذية الرياضية',
    amount: 900,
    type: 'محفظة إلكترونية',
    date: '2026-04-30',
    status: 'ناجحة'
  }
]

export function FinancePage() {
  const [activeType, setActiveType] = useState('جميع الأنواع')
  const [activePeriod, setActivePeriod] = useState('كل الفترات')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)
  const [platformEarnings, setPlatformEarnings] = useState(null)
  const [adProfits, setAdProfits] = useState(null)
  const [subscriptionProfits, setSubscriptionProfits] = useState(null)
  const [deliveryProfits, setDeliveryProfits] = useState(null)

  useEffect(() => {
    getPlatformEarnings()
      .then((data) => setPlatformEarnings(data?.data ?? data))
      .catch(() => {})
    getAdProfits()
      .then((data) => setAdProfits(data?.data ?? data))
      .catch(() => {})
    getSubscriptionProfits()
      .then((data) => setSubscriptionProfits(data?.data ?? data))
      .catch(() => {})
    getDeliveryProfits()
      .then((data) => setDeliveryProfits(data?.data ?? data))
      .catch(() => {})
  }, [])

  const formatAmount = (value, fallback) => {
    if (value == null || value === '') return fallback
    return `${Number(value).toLocaleString('ar-LY')} د.ل`
  }

  const openDetails = (tx) => {
    setSelectedTx(tx)
    setDetailsModalOpen(true)
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "رقم المعاملة,الزبون,المتجر,المبلغ,نوع العملية,التاريخ,الحالة\n"
      + filteredTransactions.map(t => `${t.id},${t.customer},${t.store},${t.amount},${t.type},${t.date},${t.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = dummyTransactions.filter(tx => {
    const matchesSearch = tx.id.includes(searchQuery) || tx.customer.includes(searchQuery) || tx.store.includes(searchQuery)
    const matchesStatus = activeStatus === 'جميع الحالات' || tx.status === activeStatus
    const matchesType = activeType === 'جميع الأنواع' || tx.type === activeType
    // For Period, we keep it simple since it's dummy data
    return matchesSearch && matchesStatus && matchesType
  })

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-200 p-3 border border-white/10 shadow-premium text-right text-sm">
          <p className="text-white mb-1">{label}</p>
          <p className="text-emerald-500">
            الإيرادات : {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">الإدارة المالية</h1>
          <p className="text-sm text-white/60">إدارة العمليات المالية والمعاملات والتقارير</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-premium">
          <Download className="size-4" />
          تصدير التقارير
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">22% ↑</div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <DollarSign className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي الإيرادات</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatAmount(platformEarnings?.total ?? platformEarnings?.amount, '226,000 د.ل')}
          </p>
        </div>
        
        {/* Success Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">أرباح الاشتراكات</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatAmount(subscriptionProfits?.total ?? subscriptionProfits?.amount, '—')}
          </p>
        </div>

        {/* Failed Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">أرباح التوصيل</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatAmount(deliveryProfits?.total ?? deliveryProfits?.amount, '—')}
          </p>
        </div>

        {/* Avg Value Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <BarChart2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">أرباح الإعلانات</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatAmount(adProfits?.total ?? adProfits?.amount, '—')}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-6 shadow-premium">
          <h2 className="text-lg font-bold text-white mb-6 text-center">الإيرادات الشهرية</h2>
          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={true} tickLine={true} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={true} tickLine={true} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} formatter={() => <span className="text-emerald-500 text-sm font-bold ml-2">الإيرادات</span>} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: 'white' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-6 shadow-premium">
          <h2 className="text-lg font-bold text-white mb-6 text-center">توزيع طرق الدفع</h2>
          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={activeStatus}
            onChange={e => setActiveStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option>جميع الحالات</option>
            <option>ناجحة</option>
            <option>معلقة</option>
            <option>فاشلة</option>
          </select>

          <select 
            value={activePeriod}
            onChange={e => setActivePeriod(e.target.value)}
            className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option>كل الفترات</option>
            <option>هذا الشهر</option>
            <option>الشهر الماضي</option>
          </select>

          <select 
            value={activeType}
            onChange={e => setActiveType(e.target.value)}
            className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option>جميع الأنواع</option>
            <option>محفظة إلكترونية</option>
            <option>نقدي</option>
          </select>
        </div>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث في المعاملات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-brand-300 py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-brand-200 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">المعاملات المالية</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 font-medium">رقم المعاملة</th>
                <th className="px-3 py-3 font-medium">الزبون</th>
                <th className="px-3 py-3 font-medium">المتجر</th>
                <th className="px-3 py-3 font-medium">المبلغ</th>
                <th className="px-3 py-3 font-medium">نوع العملية</th>
                <th className="px-3 py-3 font-medium">التاريخ</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
                <th className="px-3 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-mono text-white/80">{tx.id}</td>
                  <td className="px-3 py-3 font-medium text-white">{tx.customer}</td>
                  <td className="px-3 py-3 text-white/70">{tx.store}</td>
                  <td className="px-3 py-3 font-bold text-emerald-600" dir="ltr">{tx.amount} د.ل</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 text-white/80">
                      {tx.type} {tx.type === 'محفظة إلكترونية' ? <CreditCard className="size-4 text-brand-500" /> : <Banknote className="size-4 text-emerald-500" />}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-white/60">{tx.date}</td>
                  <td className="px-3 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.status === 'معلقة' ? 'bg-yellow-100 text-yellow-700' : 
                      tx.status === 'ناجحة' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button 
                      onClick={() => openDetails(tx)}
                      className="icon-btn-view"
                    >
                      <Eye className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-3 py-12 text-center text-white/60">
                    لا توجد معاملات مطابقة للبحث أو الفلتر.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center p-4 border-t border-white/10 bg-brand-300/50">
          <p className="text-sm font-bold text-white/80">
            إجمالي الإيرادات: <span className="text-emerald-600">3760.00 د.ل</span>
          </p>
          <p className="text-sm text-white/60">
            عرض {filteredTransactions.length} من 3 معاملة
          </p>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {detailsModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل المعاملة المالية</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-right border-b border-white/5 pb-4 mb-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedTx.status === 'معلقة' ? 'bg-yellow-100 text-yellow-700' : 
                  selectedTx.status === 'ناجحة' ? 'bg-emerald-100 text-emerald-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedTx.status}
                </span>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">{selectedTx.id}</h3>
                  <p className="text-sm text-white/60 mt-1">{selectedTx.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">الزبون</p>
                  <p className="font-bold text-white text-lg">{selectedTx.customer}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">المتجر</p>
                  <p className="font-bold text-white text-lg">{selectedTx.store}</p>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-8 text-center flex flex-col items-center justify-center">
                <p className="font-bold text-emerald-600 text-5xl mb-2" dir="ltr">{selectedTx.amount} د.ل</p>
                <p className="text-sm text-white/70">المبلغ الإجمالي</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">نوع العملية</p>
                  <p className="font-bold text-white text-lg flex items-center gap-2">
                    {selectedTx.type} 
                    {selectedTx.type === 'محفظة إلكترونية' ? <CreditCard className="size-5 text-brand-500" /> : <Banknote className="size-5 text-emerald-500" />}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">التاريخ</p>
                  <p className="font-bold text-white text-lg">{selectedTx.date}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

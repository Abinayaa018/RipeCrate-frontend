import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Pie, PieChart, Cell } from 'recharts'

const trendData = [
  { name: 'Mon', value: 110 },
  { name: 'Tue', value: 132 },
  { name: 'Wed', value: 128 },
  { name: 'Thu', value: 145 },
  { name: 'Fri', value: 162 },
  { name: 'Sat', value: 154 },
  { name: 'Sun', value: 176 },
]

const riskData = [
  { subject: 'Temperature', A: 85, fullMark: 100 },
  { subject: 'Humidity', A: 75, fullMark: 100 },
  { subject: 'Shelf life', A: 92, fullMark: 100 },
  { subject: 'Waste', A: 65, fullMark: 100 },
  { subject: 'Velocity', A: 78, fullMark: 100 },
]

function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Analytics</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">Supply chain insights</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0F1A2F] px-4 py-2 text-sm text-muted">Last 7 days</div>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#32D4F5" stopOpacity={0.75} />
                    <stop offset="95%" stopColor="#32D4F5" stopOpacity={0.12} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#A8B3C7', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#A8B3C7', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#14203A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="value" stroke="#32D4F5" strokeWidth={3} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Risk matrix</p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskData} outerRadius={90}>
                  <PolarGrid stroke="#ffffff12" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#A8B3C7', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Risk" dataKey="A" stroke="#8BD450" fill="#8BD450" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Produce composition</p>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Cold', value: 42 }, { name: 'Refrigerated', value: 34 }, { name: 'Ambient', value: 24 }]} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                    <Cell fill="#32D4F5" />
                    <Cell fill="#8BD450" />
                    <Cell fill="#5BD1F6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Loss trends</p>
          <p className="mt-5 text-3xl font-semibold text-warning">23.8%</p>
          <p className="mt-3 text-sm text-muted">Decrease in spoilage after optimization actions.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Savings</p>
          <p className="mt-5 text-3xl font-semibold text-accent2">$132k</p>
          <p className="mt-3 text-sm text-muted">Estimated operational savings over 30 days.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Warehouse comparison</p>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between rounded-3xl bg-[#0F1A2F] px-4 py-3">
              <span>North</span>
              <span className="text-text">96%</span>
            </div>
            <div className="flex items-center justify-between rounded-3xl bg-[#0F1A2F] px-4 py-3">
              <span>South</span>
              <span className="text-text">87%</span>
            </div>
            <div className="flex items-center justify-between rounded-3xl bg-[#0F1A2F] px-4 py-3">
              <span>East</span>
              <span className="text-text">82%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage

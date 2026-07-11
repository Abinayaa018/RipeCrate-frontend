import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { analyticsMetrics, analyticsTrend, produceComparison, warehouseComparison } from '../data/dashboard'
import { PageHeader } from '../components/ui'

const chartTooltip = {
  backgroundColor: '#0E1830',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  color: '#F8FAFC',
}

function AnalyticsPage() {
  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Analytics"
          title="Forecasting & Performance Intelligence"
          description="Spoilage trends, warehouse comparison, produce risk, inventory turnover, waste prevented, carbon savings, and revenue protected."
          actions={<><button className="ripple rounded-[18px] border border-white/10 bg-[#0b1a31] px-4 py-2.5 text-sm font-semibold text-text hover:border-accent/30">Schedule report</button><button className="ripple rounded-[18px] border border-accent/30 bg-accent px-4 py-2.5 text-sm font-bold text-background">Export PDF</button></>}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
          <div className="panel-soft rounded-[30px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.36em] text-muted">Monthly spoilage forecast</p>
                <h3 className="font-display mt-2 text-2xl font-bold text-text">Waste prevented is outpacing projected loss</h3>
              </div>
              <span className="rounded-full bg-accent2/10 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-accent2">Last 6 months</span>
            </div>
            <div className="mt-6 h-[390px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsTrend}>
                  <CartesianGrid stroke="#ffffff12" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Bar dataKey="prevented" fill="#7CFF6B" radius={[12, 12, 4, 4]} />
                  <Area type="monotone" dataKey="spoilage" fill="#FF5C5C22" stroke="#FF5C5C" strokeWidth={3} />
                  <Line type="monotone" dataKey="spoilage" stroke="#FFB84D" strokeWidth={3} dot={{ r: 4, fill: '#FFB84D' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4">
            {analyticsMetrics.map(metric => (
              <div key={metric.label} className="lift-card rounded-[28px] border border-white/10 bg-[#0b1a31]/80 p-6">
                <p className="text-xs uppercase tracking-[0.34em] text-muted">{metric.label}</p>
                <p className={`font-display mt-4 text-5xl font-bold ${metric.tone === 'accent2' ? 'text-accent2' : metric.tone === 'warning' ? 'text-warning' : 'text-accent'}`}>{metric.value}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{metric.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Warehouse comparison</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseComparison}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Bar dataKey="health" fill="#36D7FF" radius={[12, 12, 4, 4]} />
                <Bar dataKey="delay" fill="#FFB84D" radius={[12, 12, 4, 4]} />
                <Bar dataKey="waste" fill="#FF5C5C" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Produce comparison</p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={produceComparison} outerRadius={115}>
                <PolarGrid stroke="#ffffff12" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#9AB2D1', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="Risk" dataKey="risk" stroke="#FFB84D" fill="#FFB84D" fillOpacity={0.24} />
                <Radar name="Turnover" dataKey="turnover" stroke="#7CFF6B" fill="#7CFF6B" fillOpacity={0.2} />
                <Tooltip contentStyle={chartTooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Temperature trend</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsTrend}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="temperature" stroke="#36D7FF" strokeWidth={3} fill="#36D7FF22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Humidity & turnover</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsTrend}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltip} />
                <Area type="monotone" dataKey="humidity" stroke="#7CFF6B" strokeWidth={3} fill="#7CFF6B22" />
                <Line type="monotone" dataKey="prevented" stroke="#36D7FF" strokeWidth={3} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Saved reports</p>
          <div className="mt-6 space-y-3">
            {['Weekly executive waste report', 'South Vault root-cause analysis', 'Route delay carbon summary', 'Supplier harvest variance'].map((report, index) => (
              <button key={report} className="ripple flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-[#0b1a31]/78 p-4 text-left text-sm font-semibold text-text hover:border-accent/30">
                {report}
                <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted">R{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        {[
          ['Transportation delays', '4.1%', 'AI routing lowered late arrivals by 23%.', 'text-warning'],
          ['Inventory turnover', '7.8x', 'High velocity lanes stay inside shelf-life targets.', 'text-accent'],
          ['Revenue loss avoided', '$418K', 'Protected by prediction and transfer recommendations.', 'text-accent2'],
          ['Forecast accuracy', '92.8%', 'Ensemble model remains inside confidence band.', 'text-accent'],
        ].map(([label, value, caption, color]) => (
          <div key={label} className="lift-card panel rounded-[30px] p-6">
            <p className="text-xs uppercase tracking-[0.34em] text-muted">{label}</p>
            <p className={`font-display mt-5 text-4xl font-bold ${color}`}>{value}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{caption}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

export default AnalyticsPage

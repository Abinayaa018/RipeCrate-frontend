import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { overviewMetrics, coldChainSteps, chartData, alerts } from '../data/dashboard'

const badgeStyles = {
  accent: 'bg-accent/10 text-accent',
  accent2: 'bg-accent2/10 text-accent2',
  warning: 'bg-warning/10 text-warning',
}

const gaugeSteps = ['Stable', 'At risk', 'Critical']

function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-soft">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Inventory overview</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text">Cold-chain operations</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-surface2 px-4 py-3 text-sm text-muted">
              Realtime status
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {overviewMetrics.map(metric => (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-muted">{metric.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${metric.accent === 'accent' ? 'text-accent' : metric.accent === 'accent2' ? 'text-accent2' : 'text-warning'}`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-surface2 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Cold-chain flow</p>
            <div className="mt-6 flex items-center justify-between gap-3 text-xs text-muted">
              {coldChainSteps.map((step, index) => (
                <div key={step} className="flex-1 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#101A2C] text-accent">
                    {index + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Warehouse health</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-5">
                <p className="text-sm text-muted">Storage efficiency</p>
                <p className="mt-3 text-3xl font-semibold text-accent">87%</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-5">
                <p className="text-sm text-muted">Avg condition uptime</p>
                <p className="mt-3 text-3xl font-semibold text-accent2">98%</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Upcoming alerts</p>
            <div className="mt-5 space-y-3">
              {alerts.map(alert => (
                <div key={alert.title} className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text">{alert.title}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${alert.status === 'Critical' ? 'bg-danger/15 text-danger' : alert.status === 'Warning' ? 'bg-warning/15 text-warning' : 'bg-accent2/15 text-accent2'}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Temperature trend</p>
              <h3 className="mt-3 text-xl font-semibold text-text">Condition profile</h3>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0F1A2F] px-4 py-2 text-xs uppercase tracking-[0.28em] text-muted">Last 24 hours</div>
          </div>
          <div className="mt-8 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.tempTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#32D4F5" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#32D4F5" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#A8B3C7', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#A8B3C7', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#14203A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="temp" stroke="#32D4F5" strokeWidth={3} fill="url(#tempGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Humidity trend</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.humidityTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8BD450" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#8BD450" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff12" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: '#A8B3C7', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#A8B3C7', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#14203A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, color: '#F8FAFC' }} />
                  <Area type="monotone" dataKey="humidity" stroke="#8BD450" strokeWidth={3} fill="url(#humidityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Inventory distribution</p>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.inventoryDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                    {chartData.inventoryDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={['#32D4F5', '#8BD450', '#5BD1F6', '#203F70'][index]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#14203A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, color: '#F8FAFC' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage

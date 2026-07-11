import { useMemo, useState } from 'react'
import { alertCenter } from '../data/dashboard'
import { PageHeader, SearchBar, StatusChip } from '../components/ui'

function AlertsPage() {
  const [filter, setFilter] = useState('All')
  const alerts = useMemo(() => alertCenter.filter(alert => filter === 'All' || alert.severity === filter || alert.status === filter), [filter])

  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Alerts"
          title="Real-time notification center"
          description="Prioritize unread alerts, filter by severity, resolve incidents, and keep warehouse teams focused on operational risk."
          actions={<button className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background">Resolve selected</button>}
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_auto]">
          <SearchBar placeholder="Search alerts and sources" />
          <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/10 bg-[#071224]/74 p-2">
            {['All', 'Unread', 'Critical', 'Warning', 'Info'].map(item => (
              <button key={item} onClick={() => setFilter(item)} className={`rounded-[18px] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] ${filter === item ? 'bg-accent text-background' : 'text-muted hover:bg-white/[0.05]'}`}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel rounded-[34px] p-6">
        <div className="space-y-3">
          {alerts.map(alert => (
            <article key={alert.id} className="lift-card grid gap-4 rounded-[24px] border border-white/10 bg-[#0b1a31]/78 p-5 lg:grid-cols-[140px_1fr_120px_110px_auto] lg:items-center">
              <p className="font-mono text-sm text-accent">{alert.id}</p>
              <div>
                <p className="font-semibold text-text">{alert.title}</p>
                <p className="mt-1 text-sm text-muted">{alert.source} · {alert.time}</p>
              </div>
              <StatusChip label={alert.severity} />
              <StatusChip label={alert.status} />
              <button className="ripple rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-text hover:border-accent/30">Resolve</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AlertsPage

import { warehouseNodes, sensorFeed, timelineEvents } from '../data/dashboard'
import { ChartCard, PageHeader, SearchBar, StatCard, StatusChip } from '../components/ui'

function WarehousesPage() {
  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Warehouse Monitoring"
          title="Live facility command"
          description="Monitor facility health, sensor status, temperature, humidity, ethylene exposure, alerts, and timeline events across the cold-chain network."
          actions={<><button className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-text">Open map</button><button className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background">Add warehouse</button></>}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <StatCard label="Facilities online" value="12" caption="All regions reporting telemetry" tone="accent2" />
          <StatCard label="Average temp" value="4.3C" caption="Inside target envelope" tone="accent" />
          <StatCard label="Escalations" value="2" caption="Critical alerts need action" tone="danger" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Warehouse cards" action={<SearchBar placeholder="Search warehouses" />}>
          <div className="grid gap-4 md:grid-cols-2">
            {warehouseNodes.map(node => (
              <article key={node.label} className="lift-card rounded-[28px] border border-white/10 bg-[#0b1a31]/78 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{node.region}</p>
                    <h3 className="font-display mt-2 text-2xl font-bold text-text">{node.label}</h3>
                  </div>
                  <StatusChip label={node.status === 'red' ? 'Critical' : node.status === 'yellow' ? 'Warning' : 'Healthy'} />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-[20px] bg-white/[0.04] p-4"><p className="text-xs text-muted">Temp</p><p className="mt-2 font-bold text-accent">{node.temp}</p></div>
                  <div className="rounded-[20px] bg-white/[0.04] p-4"><p className="text-xs text-muted">Humidity</p><p className="mt-2 font-bold text-accent2">{node.humidity}</p></div>
                  <div className="rounded-[20px] bg-white/[0.04] p-4"><p className="text-xs text-muted">Batches</p><p className="mt-2 font-bold text-text">{node.batches}</p></div>
                </div>
              </article>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Facility timeline">
          <div className="relative space-y-4 pl-6">
            <div className="absolute bottom-2 left-2 top-2 w-px bg-white/10" />
            {timelineEvents.map(event => (
              <div key={event.title} className="relative rounded-[24px] border border-white/10 bg-[#0b1a31]/78 p-4">
                <span className="absolute -left-[27px] top-5 h-4 w-4 rounded-full bg-accent" />
                <p className="font-semibold text-text">{event.title}</p>
                <p className="mt-2 text-sm text-muted">{event.detail}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <ChartCard title="Live IoT sensor monitoring">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sensorFeed.map(sensor => (
            <div key={`${sensor.time}-${sensor.label}`} className="rounded-[24px] border border-white/10 bg-[#050c18]/80 p-4 font-mono text-sm">
              <p className="text-accent">{sensor.type} · {sensor.time}</p>
              <p className="mt-2 text-text">{sensor.label}</p>
              <p className="mt-3 text-2xl font-bold text-accent2">{sensor.value}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

export default WarehousesPage

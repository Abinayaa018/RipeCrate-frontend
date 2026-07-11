import { inventoryBatches } from '../data/dashboard'
import { PageHeader, SearchBar, StatusChip } from '../components/ui'

function BatchesPage() {
  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Batches"
          title="Trace every produce lot"
          description="Inspect batch details, warehouse assignment, arrival date, expiry, health, freshness curve, and operational actions."
          actions={<><button className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-text">Import CSV</button><button className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background">Create batch</button></>}
        />
        <div className="mt-8"><SearchBar placeholder="Search batches, produce, warehouse" /></div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {inventoryBatches.map((batch, index) => (
          <article key={batch.code} className="lift-card panel rounded-[30px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-muted">{batch.code}</p>
                <h3 className="font-display mt-2 text-2xl font-bold text-text">{batch.produce}</h3>
              </div>
              <StatusChip label={batch.status} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[20px] bg-white/[0.04] p-4"><p className="text-muted">Warehouse</p><p className="mt-2 font-semibold text-text">{batch.warehouse}</p></div>
              <div className="rounded-[20px] bg-white/[0.04] p-4"><p className="text-muted">Expiry</p><p className="mt-2 font-semibold text-accent">{batch.shelf}</p></div>
              <div className="rounded-[20px] bg-white/[0.04] p-4"><p className="text-muted">Arrival</p><p className="mt-2 font-semibold text-text">Jul {9 + index}, 2026</p></div>
              <div className="rounded-[20px] bg-white/[0.04] p-4"><p className="text-muted">Health</p><p className="mt-2 font-semibold text-accent2">{batch.freshness}%</p></div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/[0.06]">
              <div className={`h-2 rounded-full ${batch.freshness > 70 ? 'bg-accent2' : batch.freshness > 35 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${batch.freshness}%` }} />
            </div>
            <div className="mt-5 flex gap-3">
              <button className="ripple flex-1 rounded-[20px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-text">Details</button>
              <button className="ripple flex-1 rounded-[20px] border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">Predict</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default BatchesPage

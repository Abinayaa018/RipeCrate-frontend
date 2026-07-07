import { useState } from 'react'

const batches = [
  { code: 'BATCH-21F4B9', produce: 'Tomatoes', warehouse: 'Warehouse North', shelfLife: '8d', status: 'Healthy', humidity: '89%', temp: '4.7°C' },
  { code: 'BATCH-7A3C15', produce: 'Avocados', warehouse: 'Warehouse South', shelfLife: '3d', status: 'At risk', humidity: '93%', temp: '5.9°C' },
  { code: 'BATCH-4D9E82', produce: 'Lettuce', warehouse: 'Warehouse East', shelfLife: '1d', status: 'Critical', humidity: '96%', temp: '7.4°C' },
]

const statusStyles = {
  Healthy: 'bg-accent2/15 text-accent2',
  'At risk': 'bg-warning/15 text-warning',
  Critical: 'bg-danger/15 text-danger',
}

function InventoryPage() {
  const [search, setSearch] = useState('')

  const filtered = batches.filter(item => item.produce.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Inventory ledger</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">Batch audit</h2>
            </div>
            <button className="rounded-3xl border border-white/10 bg-[#0F1A2F] px-5 py-3 text-sm text-text transition hover:border-accent/30 hover:text-accent">
              Import inventory
            </button>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search batch code, produce, warehouse"
                className="w-full rounded-3xl border border-white/10 bg-[#0F1A2F] px-4 py-4 text-sm text-text outline-none placeholder:text-muted"
              />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {filtered.map(batch => (
              <div key={batch.code} className="rounded-[2rem] border border-white/10 bg-[#0F1A2F] p-6 transition hover:-translate-y-1 hover:border-accent/30">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted">{batch.code}</p>
                    <h3 className="text-xl font-semibold text-text">{batch.produce}</h3>
                    <p className="text-sm text-muted">{batch.warehouse}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-2 text-xs font-semibold ${statusStyles[batch.status]}`}>
                      {batch.status}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-2 text-xs text-muted">Shelf life {batch.shelfLife}</span>
                    <span className="rounded-full bg-white/5 px-3 py-2 text-xs text-muted">Humidity {batch.humidity}</span>
                    <span className="rounded-full bg-white/5 px-3 py-2 text-xs text-muted">Temp {batch.temp}</span>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-surface p-4">
                    <p className="text-sm text-muted">Timeline</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                      <span className="rounded-full bg-white/5 px-3 py-2">Arrival</span>
                      <span className="grow h-px bg-white/10" />
                      <span className="rounded-full bg-white/5 px-3 py-2">Expiry</span>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-surface p-4">
                    <p className="text-sm text-muted">QR code</p>
                    <div className="mt-4 h-28 rounded-3xl border border-white/10 bg-[#0D172B]" />
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-[#0F1A2F] p-10 text-center">
                <p className="text-lg font-semibold text-text">No batches found.</p>
                <p className="mt-2 text-sm text-muted">Try adjusting filters or import your inventory to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Batch quality</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-[#0F1A2F] p-5">
                <p className="text-sm text-muted">At-risk inventory</p>
                <p className="mt-2 text-3xl font-semibold text-warning">42 batches</p>
              </div>
              <div className="rounded-3xl bg-[#0F1A2F] p-5">
                <p className="text-sm text-muted">Critical shelf-life</p>
                <p className="mt-2 text-3xl font-semibold text-danger">12 batches</p>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Batch actions</p>
            <div className="mt-6 space-y-3">
              <button className="w-full rounded-3xl bg-accent px-4 py-4 text-sm font-semibold text-background transition hover:bg-accent/90">Generate risk report</button>
              <button className="w-full rounded-3xl border border-white/10 bg-[#0F1A2F] px-4 py-4 text-sm text-text transition hover:border-accent/30">Export batch manifest</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryPage

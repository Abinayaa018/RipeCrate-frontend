import { useMemo, useState } from 'react'
import { MixerHorizontalIcon, DownloadIcon, MagnifyingGlassIcon, RowsIcon, ViewGridIcon } from '@radix-ui/react-icons'
import { inventoryBatches } from '../data/dashboard'
import { PageHeader } from '../components/ui'

const statusStyles: Record<string, string> = {
  Healthy: 'bg-accent2/15 text-accent2 border-accent2/20',
  'At risk': 'bg-warning/15 text-warning border-warning/20',
  Critical: 'bg-danger/15 text-danger border-danger/20',
}

function MiniTrend({ values }: { values: number[] }) {
  const points = values.map((value, index) => `${index * 24},${42 - value * 0.38}`).join(' ')
  return (
    <svg viewBox="0 0 96 44" className="h-11 w-24 overflow-visible">
      <polyline points={points} fill="none" stroke="#36D7FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${points} 96,44 0,44`} fill="rgba(54,215,255,0.12)" stroke="none" />
    </svg>
  )
}

function InventoryPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const filtered = useMemo(
    () => inventoryBatches.filter(batch => {
      const matchesSearch = `${batch.code} ${batch.produce} ${batch.warehouse}`.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'All' || batch.status === status
      return matchesSearch && matchesStatus
    }),
    [search, status],
  )

  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Inventory"
          title="Batch Intelligence"
          description="Search, filter, and inspect freshness signals across every crate in the cold-chain network."
          actions={<><button className="ripple inline-flex items-center gap-2 rounded-[18px] border border-white/10 bg-[#0b1a31] px-4 py-2.5 text-sm font-semibold text-text hover:border-accent/30"><DownloadIcon /> Export CSV</button><button className="ripple inline-flex items-center gap-2 rounded-[18px] border border-accent/30 bg-accent px-4 py-2.5 text-sm font-bold text-background"><ViewGridIcon /> QR scan</button></>}
        />

        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#071224]/74 px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-accent" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search batch, produce, warehouse" className="w-full border-none bg-transparent text-sm text-text outline-none placeholder:text-muted" />
          </div>
          <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/10 bg-[#071224]/74 p-2">
            {['All', 'Healthy', 'At risk', 'Critical'].map(label => (
              <button key={label} onClick={() => setStatus(label)} className={`rounded-[18px] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition ${status === label ? 'bg-accent text-background' : 'text-muted hover:bg-white/[0.05] hover:text-text'}`}>{label}</button>
            ))}
          </div>
          <button className="ripple inline-flex items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-[#071224]/74 px-4 py-3 text-sm font-semibold text-text hover:border-accent/30">
            <MixerHorizontalIcon /> Columns
          </button>
        </div>

        <div className="mt-8 overflow-x-auto rounded-[30px] border border-white/10 bg-[#06101f]/78">
          <table className="w-full min-w-[1060px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0b1a31] text-left text-[10px] uppercase tracking-[0.32em] text-muted">
              <tr>
                {['Batch', 'Produce', 'Warehouse', 'Freshness', 'Shelf life', 'Status', 'Temp', 'Humidity', 'Trend'].map(column => (
                  <th key={column} className="px-5 py-4 font-semibold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(batch => (
                <tr key={batch.code} className="border-t border-white/10 transition hover:bg-white/[0.04]">
                  <td className="px-5 py-5">
                    <p className="font-semibold text-text">{batch.code}</p>
                    <p className="mt-1 text-xs text-muted">QR attached</p>
                  </td>
                  <td className="px-5 py-5 text-sm text-text">{batch.produce}</td>
                  <td className="px-5 py-5">
                    <p className="text-sm text-text">{batch.warehouse}</p>
                    <p className="mt-1 text-xs text-muted">Cold zone active</p>
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl font-bold text-text">{batch.freshness}</span>
                      <div className="h-2 w-28 rounded-full bg-white/[0.06]">
                        <div className={`h-2 rounded-full ${batch.freshness > 70 ? 'bg-accent2' : batch.freshness > 35 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${batch.freshness}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 text-sm font-semibold text-accent">{batch.shelf}</td>
                  <td className="px-5 py-5">
                    <span className={`rounded-full border px-3 py-2 text-xs font-semibold ${statusStyles[batch.status]}`}>{batch.status}</span>
                  </td>
                  <td className="px-5 py-5 text-sm text-text">{batch.temp}</td>
                  <td className="px-5 py-5 text-sm text-text">{batch.humidity}</td>
                  <td className="px-5 py-5"><MiniTrend values={batch.trend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr_0.8fr]">
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Freshness summary</p>
          <div className="mt-6 grid gap-4">
            {[
              ['Healthy batches', '318', 'text-accent2'],
              ['At risk batches', '23', 'text-warning'],
              ['Critical shelf life', '12', 'text-danger'],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-[#0b1a31]/78 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-muted">{label}</p>
                <p className={`font-display mt-3 text-4xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Column chooser</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Freshness', 'Shelf life', 'Temp drift', 'Humidity', 'Supplier', 'Route ETA', 'Revenue risk', 'Carbon cost', 'Model score'].map(item => (
              <label key={item} className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-[#0b1a31]/78 p-4 text-sm text-text">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#36D7FF]" />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Scanner tools</p>
          <div className="mt-6 rounded-[28px] border border-dashed border-accent/30 bg-accent/5 p-6 text-center">
            <RowsIcon className="mx-auto h-10 w-10 text-accent" />
            <p className="mt-4 font-semibold text-text">Barcode scanner placeholder</p>
            <p className="mt-2 text-sm leading-6 text-muted">Ready for camera integration and batch lookup.</p>
          </div>
          <div className="mt-4 grid gap-3">
            <button className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-4 text-sm font-semibold text-text hover:border-accent/30">Generate risk report</button>
            <button className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-4 text-sm font-semibold text-text hover:border-accent/30">Schedule audit</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InventoryPage

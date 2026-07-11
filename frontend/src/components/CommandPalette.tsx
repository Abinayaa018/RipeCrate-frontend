import { useEffect, useState } from 'react'
import { LightningBoltIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

const shortcuts = [
  { label: 'Open Command Center', key: 'D', meta: 'Network health' },
  { label: 'Run AI Prediction', key: 'P', meta: 'Shelf-life model' },
  { label: 'Scan Inventory Batch', key: 'I', meta: 'QR and barcode' },
  { label: 'Generate Executive Report', key: 'R', meta: 'PDF export' },
]

function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className={`${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-50 flex items-start justify-center bg-[#020713]/72 p-6 pt-24 backdrop-blur-xl transition-opacity duration-200`}>
      <div className="panel w-full max-w-3xl rounded-[34px] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-accent">Command Palette</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-text">Search actions, reports, and AI workflows</h2>
          </div>
          <button onClick={() => setOpen(false)} className="ripple rounded-[20px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-muted transition hover:border-accent/30 hover:text-accent">Close</button>
        </div>
        <div className="flex items-center gap-3 rounded-[26px] border border-white/10 bg-[#071224]/82 px-5 py-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-accent" />
          <input placeholder="Search commands..." className="w-full border-none bg-transparent text-lg text-text outline-none placeholder:text-muted" />
          <span className="rounded-xl bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted">Esc</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {shortcuts.map(item => (
            <button key={item.label} className="lift-card flex items-center gap-4 rounded-[24px] border border-white/10 bg-[#0b1a31]/78 p-4 text-left">
              <span className="grid h-11 w-11 place-items-center rounded-[18px] bg-accent/10 text-accent">
                <LightningBoltIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-text">{item.label}</span>
                <span className="mt-1 block text-xs text-muted">{item.meta}</span>
              </span>
              <span className="rounded-xl bg-white/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted">Ctrl {item.key}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette

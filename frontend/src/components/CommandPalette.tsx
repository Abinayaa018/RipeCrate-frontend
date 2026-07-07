import { useEffect, useState } from 'react'

const shortcuts = [
  { label: 'Go to Dashboard', key: 'd' },
  { label: 'Open AI Prediction', key: 'p' },
  { label: 'Open Inventory', key: 'i' },
  { label: 'Show Analytics', key: 'a' },
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
    <div className={`${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-6 transition-opacity duration-200`}> 
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0D1628] p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Command palette</p>
            <h2 className="mt-2 text-lg font-semibold">Type a command or page</h2>
          </div>
          <button onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-accent/30 hover:text-accent">Close</button>
        </div>
        <div className="rounded-3xl border border-white/10 bg-surface px-4 py-4">
          <input placeholder="Search commands…" className="w-full border-none bg-transparent text-lg text-text outline-none placeholder:text-muted" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {shortcuts.map(item => (
            <div key={item.key} className="rounded-3xl border border-white/10 bg-surface2 px-4 py-4">
              <p className="text-sm text-muted">{item.label}</p>
              <span className="mt-2 inline-flex rounded-2xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.28em] text-text">Ctrl + {item.key.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette

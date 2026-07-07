import { BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'

function Topbar() {
  return (
    <div className="flex flex-col gap-5 border-b border-white/10 bg-[#0F172A] px-6 py-5 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-muted">Operations platform</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">RipeCrate intelligence</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-surface px-4 py-3 text-sm text-text transition hover:border-accent/30 hover:text-accent">
            <MagnifyingGlassIcon className="h-4 w-4 text-accent" />
            Quick search
          </button>
          <button className="inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-white/10 bg-surface text-muted transition hover:border-accent/30 hover:text-accent">
            <BellIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Topbar

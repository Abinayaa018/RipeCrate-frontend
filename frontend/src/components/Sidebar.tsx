import { Link, useLocation } from 'react-router-dom'
import { BarChartIcon, BoxIcon, DashboardIcon, PieChartIcon, StarIcon } from '@radix-ui/react-icons'

const items = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/prediction', label: 'AI Prediction', icon: PieChartIcon },
  { path: '/inventory', label: 'Inventory', icon: BoxIcon },
  { path: '/analytics', label: 'Analytics', icon: BarChartIcon },
]

function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-surface px-6 py-6 lg:block">
      <div className="flex flex-col gap-8">
        <div>
          <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[#121a2d] px-4 py-3 shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F1A2F] text-accent">
              <StarIcon width={20} height={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">RipeCrate</p>
              <p className="text-sm text-text/90">Cold-chain intelligence</p>
            </div>
          </div>
          <nav className="space-y-2">
            {items.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active ? 'bg-accent/10 text-accent shadow-soft' : 'text-muted hover:bg-white/5 hover:text-text'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111826] p-5 text-sm">
          <p className="mb-3 text-xs uppercase tracking-[0.32em] text-muted">Cold chain flow</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3 text-xs text-muted">
              <span>Warehouse</span>
              <span className="text-accent">Online</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3 text-xs text-muted">
              <span>Storage</span>
              <span className="text-accent">Stable</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3 text-xs text-muted">
              <span>Engine</span>
              <span className="text-accent">Active</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

import { PageHeader, StatCard } from '../components/ui'

function ProfilePage() {
  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Profile"
          title="Operations manager profile"
          description="Role-aware dashboard identity with permissions, assigned warehouses, recent activity, and authentication state."
          actions={<button className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background">Edit profile</button>}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <StatCard label="Role" value="Manager" caption="Warehouse Manager" tone="accent" />
          <StatCard label="Facilities" value="4" caption="Assigned warehouses" tone="accent2" />
          <StatCard label="Reports" value="18" caption="Generated this month" tone="warning" />
          <StatCard label="Security" value="MFA" caption="Protected route ready" tone="accent2" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="panel rounded-[34px] p-6 text-center">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-[34px] border border-accent/30 bg-accent/10 font-display text-4xl font-bold text-accent">RC</div>
          <h3 className="font-display mt-5 text-2xl font-bold text-text">RipeCrate Admin</h3>
          <p className="mt-2 text-sm text-muted">admin@ripecrate.ai</p>
        </div>
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Recent activity</p>
          <div className="mt-6 space-y-3">
            {['Resolved South Vault humidity alert', 'Generated executive spoilage report', 'Ran shelf-life forecast for Batch 482', 'Updated notification settings'].map(item => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-[#0b1a31]/78 p-4 text-sm font-semibold text-text">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfilePage

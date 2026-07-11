import { settingsGroups } from '../data/dashboard'
import { PageHeader, StatusChip } from '../components/ui'

function SettingsPage() {
  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Settings"
          title="Workspace controls"
          description="Manage profile settings, API keys, notifications, theme, language, security, and role-based access policies."
          actions={<button className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background">Save changes</button>}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Profile and security</p>
          <div className="mt-6 space-y-4">
            {settingsGroups.map(group => (
              <div key={group.title} className="rounded-[24px] border border-white/10 bg-[#0b1a31]/78 p-5">
                <p className="font-semibold text-text">{group.title}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map(item => <span key={item} className="rounded-full bg-white/[0.05] px-3 py-2 text-xs text-muted">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Preferences</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Theme', 'Dark navy', 'Ready'],
              ['Language', 'English', 'Ready'],
              ['Notifications', 'Critical + digest', 'Ready'],
              ['JWT sessions', '8 hour expiry', 'Ready'],
              ['API access', 'Production key active', 'Ready'],
              ['Role', 'Warehouse Manager', 'Ready'],
            ].map(([label, value, status]) => (
              <label key={label} className="rounded-[24px] border border-white/10 bg-[#0b1a31]/78 p-5">
                <span className="text-xs uppercase tracking-[0.3em] text-muted">{label}</span>
                <input defaultValue={value} className="mt-3 w-full border-none bg-transparent text-sm font-semibold text-text outline-none" />
                <span className="mt-4 inline-block"><StatusChip label={status} /></span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default SettingsPage

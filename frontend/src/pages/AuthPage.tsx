import { PageHeader } from '../components/ui'

function AuthPage() {
  return (
    <div className="page-enter mx-auto max-w-5xl space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Authentication"
          title="Protected access"
          description="Login, register, forgot password, JWT sessions, and role-based dashboard flows are represented here for production integration."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Login</p>
          <div className="mt-6 space-y-4">
            <input aria-label="Email" placeholder="Email" className="w-full rounded-[22px] border border-white/10 bg-[#071224]/74 px-4 py-4 text-sm text-text outline-none" />
            <input aria-label="Password" placeholder="Password" type="password" className="w-full rounded-[22px] border border-white/10 bg-[#071224]/74 px-4 py-4 text-sm text-text outline-none" />
            <button className="ripple w-full rounded-[22px] bg-accent px-4 py-4 text-sm font-bold text-background">Sign in</button>
          </div>
        </form>
        <form className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Register</p>
          <div className="mt-6 space-y-4">
            <input aria-label="Name" placeholder="Name" className="w-full rounded-[22px] border border-white/10 bg-[#071224]/74 px-4 py-4 text-sm text-text outline-none" />
            <input aria-label="Work email" placeholder="Work email" className="w-full rounded-[22px] border border-white/10 bg-[#071224]/74 px-4 py-4 text-sm text-text outline-none" />
            <select aria-label="Role" className="w-full rounded-[22px] border border-white/10 bg-[#071224]/74 px-4 py-4 text-sm text-text outline-none">
              <option>Admin</option>
              <option>Warehouse Manager</option>
              <option>Operator</option>
            </select>
            <button className="ripple w-full rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-4 text-sm font-bold text-text">Create account</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AuthPage

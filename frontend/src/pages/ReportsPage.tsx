import { reports } from '../data/dashboard'
import { EmptyState, PageHeader, SearchBar, StatusChip } from '../components/ui'

function ReportsPage() {
  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Reports"
          title="Automated report generation"
          description="Generate PDF and CSV reports with historical analysis, date filtering, sustainability metrics, and executive-ready summaries."
          actions={<><button className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-text">Download CSV</button><button className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background">Generate PDF</button></>}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <SearchBar placeholder="Search reports" />
          <input type="date" aria-label="Start date" className="rounded-[24px] border border-white/10 bg-[#071224]/74 px-4 py-3 text-sm text-text outline-none" />
          <input type="date" aria-label="End date" className="rounded-[24px] border border-white/10 bg-[#071224]/74 px-4 py-3 text-sm text-text outline-none" />
        </div>
      </section>

      <section className="panel rounded-[34px] p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="text-left text-[10px] uppercase tracking-[0.32em] text-muted">
              <tr>{['Report', 'Type', 'Range', 'Owner', 'Status', 'Actions'].map(col => <th key={col} className="px-4 py-4">{col}</th>)}</tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.name} className="border-t border-white/10">
                  <td className="px-4 py-5 font-semibold text-text">{report.name}</td>
                  <td className="px-4 py-5 text-sm text-muted">{report.type}</td>
                  <td className="px-4 py-5 text-sm text-muted">{report.range}</td>
                  <td className="px-4 py-5 text-sm text-muted">{report.owner}</td>
                  <td className="px-4 py-5"><StatusChip label={report.status} /></td>
                  <td className="px-4 py-5"><button className="ripple rounded-[18px] border border-white/10 px-4 py-3 text-sm font-semibold text-text">Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <EmptyState title="Historical archive connected" description="Use date filters to retrieve generated reports from SQLite in development or PostgreSQL in production." />
    </div>
  )
}

export default ReportsPage

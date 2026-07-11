import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { featureImportance, mlInsights, predictionHistory } from '../data/dashboard'
import { ChartCard, PageHeader, StatCard } from '../components/ui'

function MLInsightsPage() {
  return (
    <div className="page-enter space-y-8">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="ML Insights"
          title="Explainable AI cockpit"
          description="Show which factors influenced each prediction, monitor model accuracy, review confidence bands, and expose AI reasoning in a judge-friendly way."
          actions={<><button className="ripple rounded-[22px] border border-white/10 bg-[#0b1a31] px-4 py-3 text-sm font-semibold text-text">Model docs</button><button className="ripple rounded-[22px] bg-accent px-4 py-3 text-sm font-bold text-background">Run audit</button></>}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <StatCard label="Model accuracy" value="92.8%" caption="Validation accuracy" tone="accent" />
          <StatCard label="Predictions today" value="214" caption="Across 12 warehouses" tone="accent2" />
          <StatCard label="Avg confidence" value="94%" caption="High signal quality" tone="accent2" />
          <StatCard label="Model drift" value="Low" caption="Inside control limits" tone="warning" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <ChartCard title="SHAP-style feature importance">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ left: 12, right: 18 }}>
                <CartesianGrid stroke="#ffffff12" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0E1830', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, color: '#F8FAFC' }} />
                <Bar dataKey="value" radius={[0, 14, 14, 0]}>
                  {featureImportance.map((item, index) => <Cell key={item.name} fill={index < 2 ? '#36D7FF' : index === 2 ? '#FFB84D' : '#7CFF6B'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Shelf-life prediction timeline">
          <div className="grid gap-4">
            {predictionHistory.map(item => (
              <div key={item.period} className="rounded-[24px] border border-white/10 bg-[#0b1a31]/78 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text">{item.period}</p>
                  <p className="text-sm text-muted">Confidence {item.confidence}%</p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/[0.06]"><div className="h-2 rounded-full bg-warning" style={{ width: `${item.risk}%` }} /></div>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {mlInsights.map(item => (
          <article key={item.factor} className="lift-card panel rounded-[30px] p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-muted">{item.factor}</p>
            <p className="font-display mt-4 text-4xl font-bold text-accent">{item.impact}</p>
            <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default MLInsightsPage

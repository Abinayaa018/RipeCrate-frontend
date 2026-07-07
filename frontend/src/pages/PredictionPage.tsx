import { useState } from 'react'

const formFields = [
  { label: 'Produce', key: 'produce', type: 'text' },
  { label: 'Harvest date', key: 'harvestDate', type: 'date' },
  { label: 'Temperature (°C)', key: 'temperature', type: 'number' },
  { label: 'Humidity (%)', key: 'humidity', type: 'number' },
  { label: 'Packaging', key: 'packaging', type: 'text' },
  { label: 'Storage type', key: 'storageType', type: 'text' },
]

const recommendationItems = [
  { title: 'Optimize cold storage', description: 'Reduce temperature by 1–2°C to slow enzymatic activity.', priority: 'High' },
  { title: 'Adjust humidity', description: 'Maintain 88–92% humidity for this batch profile.', priority: 'Medium' },
  { title: 'Stage for priority dispatch', description: 'Move at-risk produce closer to loading docks.', priority: 'High' },
]

function PredictionPage() {
  const [result] = useState({
    shelfLife: 10.4,
    confidence: 92,
    risk: 'Medium',
    spoilage: 14,
  })

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-soft">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Prediction workspace</p>
          <h2 className="mt-3 text-3xl font-semibold text-text">Batch intelligence input</h2>
        </div>
        <div className="grid gap-4">
          {formFields.map(field => (
            <div key={field.key} className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-4">
              <label className="block text-sm text-muted">{field.label}</label>
              <input
                type={field.type}
                className="mt-3 w-full border-none bg-transparent text-text outline-none placeholder:text-muted"
                placeholder={field.label}
              />
            </div>
          ))}
        </div>
        <button className="mt-8 inline-flex items-center justify-center rounded-3xl bg-accent px-6 py-4 text-sm font-semibold text-background transition hover:bg-accent/90">
          Run prediction
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">Prediction result</p>
              <h2 className="mt-3 text-3xl font-semibold text-text">Shelf life dashboard</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0F1A2F] px-4 py-2 text-sm text-muted">Live model</div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[0.7fr_1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#0F1A2F] p-8 text-center">
              <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-white/10 bg-[#101A2C] text-accent">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted">Remaining shelf life</p>
                  <p className="mt-4 text-5xl font-semibold">{result.shelfLife}d</p>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Confidence</span>
                  <span className="text-sm font-semibold text-accent">{result.confidence}%</span>
                </div>
                <div className="rounded-full bg-white/5 p-1">
                  <div className="h-3 rounded-full bg-accent" style={{ width: `${result.confidence}%` }} />
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-surface px-4 py-3">
                  <span className="text-sm text-muted">Risk meter</span>
                  <span className="text-sm font-semibold text-warning">{result.risk}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[2rem] border border-white/10 bg-[#0F1A2F] p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-muted">Spoilage probability</p>
                <div className="mt-4 flex items-end gap-4">
                  <p className="text-5xl font-semibold text-accent">{result.spoilage}%</p>
                  <div className="flex-1 rounded-3xl bg-white/5 p-4">
                    <div className="h-4 rounded-full bg-accent" style={{ width: `${result.spoilage}%` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-surface p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-muted">AI recommendations</p>
                <div className="mt-5 space-y-4">
                  {recommendationItems.map(item => (
                    <div key={item.title} className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-text">{item.title}</p>
                        <span className="rounded-full bg-accent2/10 px-3 py-1 text-xs font-semibold text-accent2">{item.priority}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-surface p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Environment suggestions</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-5">
              <p className="text-sm font-medium text-text">Reduce temperature variance</p>
              <p className="mt-2 text-sm text-muted">Keep ambient storage within 0.8°C range to avoid thermal spikes.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0F1A2F] p-5">
              <p className="text-sm font-medium text-text">Stabilize humidity</p>
              <p className="mt-2 text-sm text-muted">Adjust humidity controls to maintain 88–92% for sensitive produce.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictionPage

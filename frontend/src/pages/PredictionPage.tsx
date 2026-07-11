import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { featureImportance, predictionHistory } from '../data/dashboard'
import { PageHeader } from '../components/ui'

const inputFields = [
  { label: 'Produce', key: 'produce', type: 'select', options: ['Tomatoes', 'Berries', 'Leafy greens', 'Avocados', 'Dairy'] },
  { label: 'Temperature', key: 'temperature', type: 'number', suffix: 'C' },
  { label: 'Humidity', key: 'humidity', type: 'number', suffix: '%' },
  { label: 'Packaging', key: 'packaging', type: 'select', options: ['Ventilated crate', 'MAP sealed', 'Wax carton', 'Reusable tote'] },
  { label: 'Storage Type', key: 'storageType', type: 'select', options: ['Cold storage', 'Reefer truck', 'Retail dock', 'Ripening room'] },
  { label: 'Days Since Harvest', key: 'daysSinceHarvest', type: 'number' },
  { label: 'Transportation Time', key: 'transportTime', type: 'number', suffix: 'h' },
  { label: 'Weight', key: 'weight', type: 'number', suffix: 'kg' },
  { label: 'Warehouse', key: 'warehouse', type: 'select', options: ['North Hub', 'South Vault', 'East Cold', 'Port Gate'] },
]

function PredictionPage() {
  const [temperature, setTemperature] = useState(4.8)
  const [humidity, setHumidity] = useState(89)

  const result = useMemo(() => {
    const tempPenalty = Math.max(0, temperature - 3.8) * 3.6
    const humidityPenalty = Math.max(0, humidity - 86) * 0.9
    const probability = Math.round(10 + tempPenalty + humidityPenalty)
    return {
      shelfLife: Math.max(2.4, 10.8 - probability / 8).toFixed(1),
      probability,
      recommendation: probability > 20 ? 'Move Batch 482 to Cold Storage' : 'Keep batch in current bay',
      confidence: Math.max(84, 98 - Math.round(probability / 4)),
      expiry: 'July 16, 2026',
    }
  }, [temperature, humidity])

  const confidenceData = [{ name: 'confidence', value: result.confidence, fill: '#7CFF6B' }]
  const riskSeries = predictionHistory.map(item => ({ ...item, risk: Math.min(72, item.risk + Math.round(result.probability / 5)) }))

  return (
    <div className="page-enter space-y-6">
      <section className="panel rounded-[36px] p-6 sm:p-8">
        <PageHeader
          eyebrow="Prediction Lab"
          title="AI Shelf-Life Forecast"
          description="Tune operating conditions and watch the model update remaining shelf life, spoilage probability, confidence, risk factors, and recommended storage actions."
          actions={<><button className="ripple rounded-[18px] border border-white/10 bg-[#0b1a31] px-4 py-2.5 text-sm font-semibold text-text hover:border-accent/30">Save scenario</button><button className="ripple rounded-[18px] border border-accent/30 bg-accent px-4 py-2.5 text-sm font-bold text-background">Run prediction</button></>}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="panel-soft rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.36em] text-muted">Input controls</p>
              <span className="rounded-full bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-muted">Batch 482</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {inputFields.map(field => (
                <label key={field.key} className="rounded-[24px] border border-white/10 bg-[#071224]/72 p-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted">{field.label}</span>
                  {field.type === 'select' ? (
                    <select className="mt-3 w-full border-none bg-transparent text-sm font-semibold text-text outline-none">
                      {field.options?.map(option => <option key={option} className="bg-[#071224]">{option}</option>)}
                    </select>
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={field.key === 'temperature' ? temperature : field.key === 'humidity' ? humidity : field.key === 'daysSinceHarvest' ? 3 : field.key === 'transportTime' ? 9 : 420}
                        onChange={event => {
                          if (field.key === 'temperature') setTemperature(Number(event.target.value))
                          if (field.key === 'humidity') setHumidity(Number(event.target.value))
                        }}
                        className="w-full border-none bg-transparent text-sm font-semibold text-text outline-none"
                      />
                      {field.suffix && <span className="text-xs text-muted">{field.suffix}</span>}
                    </div>
                  )}
                </label>
              ))}
            </div>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-[#0b1a31]/80 p-5">
              <p className="text-xs uppercase tracking-[0.34em] text-muted">Scheduled predictions</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs uppercase tracking-[0.18em] text-muted">
                <span className="rounded-[18px] bg-white/[0.04] px-3 py-3">06:00</span>
                <span className="rounded-[18px] bg-white/[0.04] px-3 py-3">14:00</span>
                <span className="rounded-[18px] bg-white/[0.04] px-3 py-3">22:00</span>
              </div>
            </div>
          </div>

          {/* Results: 3 stat cards + Model diagnosis side by side */}
          <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
            {/* Left: 3 stat cards stacked equally */}
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="panel-soft rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.36em] text-muted">Remaining shelf life</p>
                <p className="font-display mt-3 text-5xl font-bold text-accent">{result.shelfLife}d</p>
                <p className="mt-2 text-xs text-muted">Expiry: {result.expiry}</p>
              </div>
              <div className="panel-soft rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.36em] text-muted">Spoilage probability</p>
                <p className="font-display mt-3 text-5xl font-bold text-warning">{result.probability}%</p>
                <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
                  <div className="h-2 rounded-full bg-warning transition-all duration-700" style={{ width: `${result.probability}%` }} />
                </div>
              </div>
              <div className="panel-soft rounded-[24px] p-5">
                <p className="text-xs uppercase tracking-[0.36em] text-muted">Recommended storage</p>
                <p className="mt-3 text-base font-semibold leading-6 text-text">{result.recommendation}</p>
                <p className="mt-2 text-xs leading-5 text-muted">Normalize humidity to extend sale window.</p>
              </div>
            </div>

            {/* Right: Model diagnosis card */}
            <div className="panel-soft rounded-[24px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.36em] text-muted">Model diagnosis</p>
                  <h3 className="font-display mt-1 text-xl font-bold text-text">AI Results</h3>
                </div>
                <span className="rounded-full bg-accent2/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-accent2">v2.4.8</span>
              </div>

              {/* Confidence score — flex row, no negative margin hacks */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-[#071224]/72 p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">Confidence score</p>
                  <div className="relative mt-3 flex items-center justify-center">
                    <div className="h-36 w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="68%" outerRadius="100%" data={confidenceData} startAngle={90} endAngle={-270}>
                          <RadialBar dataKey="value" cornerRadius={12} background={{ fill: 'rgba(255,255,255,0.06)' }} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <p className="font-display text-3xl font-bold text-accent2">{result.confidence}%</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/10 bg-[#071224]/72 p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-muted">Risk level</p>
                  <div className="mt-3 space-y-2">
                    {['Low', 'Medium', 'High', 'Critical'].map((label, index) => (
                      <div key={label} className={`rounded-[12px] px-3 py-2 text-sm font-semibold ${
                        index === 1 ? 'bg-warning/15 text-warning' : 'bg-white/[0.04] text-muted'
                      }`}>{label}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/10 bg-[#071224]/72 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-muted">Feature importance</p>
                <div className="mt-3 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportance} layout="vertical" margin={{ left: 8, right: 12 }}>
                      <CartesianGrid stroke="#ffffff12" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={128} tick={{ fill: '#9AB2D1', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0E1830', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#F8FAFC' }} />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                        {featureImportance.map((item, index) => (
                          <Cell key={item.name} fill={index < 2 ? '#36D7FF' : index === 2 ? '#FFB84D' : '#7CFF6B'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Prediction history</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskSeries}>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9AB2D1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0E1830', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="risk" stroke="#FFB84D" strokeWidth={3} fill="#FFB84D22" />
                <Line type="monotone" dataKey="confidence" stroke="#7CFF6B" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel rounded-[34px] p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">Recommendation cards</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {['Reduce humidity by 4%', 'Move tomatoes to East Cold', 'Generate PDF report', 'Attach QR scan to batch'].map(item => (
              <button key={item} className="ripple lift-card rounded-[24px] border border-white/10 bg-[#0b1a31]/80 p-5 text-left text-sm font-semibold text-text">{item}</button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default PredictionPage

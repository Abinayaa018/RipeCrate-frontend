export const overviewMetrics = [
  { label: 'Active batches', value: '1,248', accent: 'accent' },
  { label: 'Avg remaining shelf life', value: '12.7 days', accent: 'accent2' },
  { label: 'Spoilage risk', value: '8.4%', accent: 'warning' },
  { label: 'Warehouse health', value: '91%', accent: 'accent' },
]

export const coldChainSteps = [
  'Warehouse',
  'Storage',
  'Prediction',
  'Distribution',
  'Retail',
]

export const chartData = {
  inventoryDistribution: [
    { name: 'Cold storage', value: 41 },
    { name: 'Refrigerated', value: 29 },
    { name: 'Ambient', value: 17 },
    { name: 'Controlled', value: 13 },
  ],
  tempTrend: [
    { time: '06:00', temp: 4.2 },
    { time: '09:00', temp: 4.6 },
    { time: '12:00', temp: 5.1 },
    { time: '15:00', temp: 4.9 },
    { time: '18:00', temp: 4.7 },
    { time: '21:00', temp: 4.5 },
  ],
  humidityTrend: [
    { time: '06:00', humidity: 87 },
    { time: '09:00', humidity: 88 },
    { time: '12:00', humidity: 89 },
    { time: '15:00', humidity: 88.5 },
    { time: '18:00', humidity: 88 },
    { time: '21:00', humidity: 87.5 },
  ],
}

export const alerts = [
  { title: 'Temperature spike detected in Warehouse South', status: 'Critical', time: '12 min ago' },
  { title: 'Batch BATCH-9A1C93 is expiring within 2 days', status: 'Warning', time: '34 min ago' },
  { title: 'Humidity out of range for batch BATCH-54F02E', status: 'Info', time: '1h ago' },
]

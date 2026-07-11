export const heroMetrics = [
  { label: 'Operational health', value: '96.8%', delta: '+4.2%', accent: 'accent' },
  { label: 'Spoilage risk', value: '12.4%', delta: '-18%', accent: 'accent2' },
  { label: 'Warehouse temp', value: '4.1C', delta: 'stable', accent: 'accent' },
  { label: 'AI actions', value: '27', delta: '2 urgent', accent: 'warning' },
]

export const warehouseNodes = [
  { label: 'North Hub', region: 'Chicago', x: '43%', y: '33%', status: 'green', temp: '3.8C', humidity: '88%', batches: 318 },
  { label: 'Port Gate', region: 'Oakland', x: '17%', y: '48%', status: 'yellow', temp: '5.4C', humidity: '91%', batches: 144 },
  { label: 'South Vault', region: 'Houston', x: '36%', y: '64%', status: 'red', temp: '6.2C', humidity: '94%', batches: 207 },
  { label: 'East Cold', region: 'Newark', x: '67%', y: '42%', status: 'green', temp: '3.6C', humidity: '86%', batches: 252 },
  { label: 'Retail Dock', region: 'Toronto', x: '59%', y: '24%', status: 'yellow', temp: '4.9C', humidity: '89%', batches: 98 },
  { label: 'EU Relay', region: 'Rotterdam', x: '82%', y: '36%', status: 'green', temp: '3.2C', humidity: '84%', batches: 166 },
]

export const chainSteps = [
  { label: 'Farm', detail: 'Harvest aligned', temp: '12C', humidity: '72%', delay: '0m', status: 'green' },
  { label: 'Transport', detail: 'Reefer lane active', temp: '4-6C', humidity: '88%', delay: '18m', status: 'yellow' },
  { label: 'Warehouse', detail: 'Storage optimized', temp: '2-4C', humidity: '86%', delay: '0m', status: 'green' },
  { label: 'Distribution', detail: 'Hub staging', temp: '5C', humidity: '87%', delay: '11m', status: 'yellow' },
  { label: 'Retail', detail: 'Shelf delivery', temp: '7C', humidity: '80%', delay: '41m', status: 'red' },
]

export const shelfLifeDistribution = [
  { range: '0-2d', count: 12 },
  { range: '3-5d', count: 34 },
  { range: '6-9d', count: 52 },
  { range: '10-14d', count: 18 },
  { range: '15+d', count: 10 },
]

export const spoilagePrediction = [
  { period: '24h', value: 8, baseline: 14 },
  { period: '48h', value: 16, baseline: 25 },
  { period: '72h', value: 24, baseline: 34 },
  { period: '7d', value: 29, baseline: 45 },
]

export const inventoryHeatmap = [
  { warehouse: 'North Hub', Tomatoes: 82, Berries: 44, Greens: 68, Dairy: 76, Avocados: 91 },
  { warehouse: 'South Vault', Tomatoes: 58, Berries: 52, Greens: 90, Dairy: 48, Avocados: 64 },
  { warehouse: 'East Cold', Tomatoes: 92, Berries: 74, Greens: 38, Dairy: 64, Avocados: 80 },
  { warehouse: 'Retail Dock', Tomatoes: 49, Berries: 62, Greens: 54, Dairy: 84, Avocados: 57 },
]

export const sensorFeed = [
  { time: '14:22:08', type: 'TEMP', label: 'North Hub / Aisle 04', value: '3.8C', status: 'good' },
  { time: '14:22:11', type: 'HUM', label: 'South Vault / Berry zone', value: '91%', status: 'warning' },
  { time: '14:22:17', type: 'DOOR', label: 'East Cold / Dock 2', value: 'Open 02:12', status: 'critical' },
  { time: '14:22:24', type: 'ENERGY', label: 'Retail Dock / Compressor B', value: '7.2 kW', status: 'good' },
  { time: '14:22:31', type: 'VIBE', label: 'Port Gate / Reefer 18', value: '0.2g', status: 'good' },
  { time: '14:22:39', type: 'MODEL', label: 'Shelf-life ensemble', value: 'v2.4.8', status: 'good' },
]

export const timelineEvents = [
  { title: 'Batch 482 rerouted to cold storage', detail: 'Tomatoes moved before 72h risk threshold.', time: '2m ago', type: 'critical' },
  { title: 'Humidity normalized in South Vault', detail: 'Berry bay returned to target envelope.', time: '12m ago', type: 'warning' },
  { title: 'Delay forecast updated for Port Gate', detail: 'AI reduced ETA variance from 42m to 19m.', time: '42m ago', type: 'info' },
  { title: 'Sensor calibration completed', detail: 'All dock probes within tolerance.', time: '1h ago', type: 'resolved' },
]

export const recommendations = [
  { title: 'Move Batch 482 to Cold Storage', hint: 'Preserve tomatoes for 24h longer', tone: 'warning' },
  { title: 'Reduce humidity by 4%', hint: 'Optimize berry storage envelope', tone: 'accent2' },
  { title: 'Transfer lettuce to East Cold', hint: 'Free South Vault capacity for incoming dairy', tone: 'accent' },
  { title: 'Generate supplier report', hint: 'Three farms show recurring harvest-delay patterns', tone: 'neutral' },
]

export const inventoryBatches = [
  { code: '482-ALP', produce: 'Tomatoes', warehouse: 'North Hub', shelf: '6d', status: 'Healthy', temp: '4.1C', humidity: '89%', freshness: 78, trend: [68, 72, 70, 74, 78] },
  { code: '914-BRT', produce: 'Leafy greens', warehouse: 'South Vault', shelf: '2d', status: 'At risk', temp: '5.6C', humidity: '94%', freshness: 38, trend: [62, 55, 49, 42, 38] },
  { code: '208-CTX', produce: 'Berries', warehouse: 'East Cold', shelf: '3d', status: 'At risk', temp: '4.8C', humidity: '91%', freshness: 52, trend: [60, 59, 56, 53, 52] },
  { code: '701-MND', produce: 'Avocados', warehouse: 'Retail Dock', shelf: '9d', status: 'Healthy', temp: '4.3C', humidity: '87%', freshness: 84, trend: [79, 81, 80, 83, 84] },
  { code: '319-KEL', produce: 'Strawberries', warehouse: 'Port Gate', shelf: '1d', status: 'Critical', temp: '6.4C', humidity: '96%', freshness: 18, trend: [44, 38, 29, 22, 18] },
  { code: '540-ORB', produce: 'Mangoes', warehouse: 'EU Relay', shelf: '11d', status: 'Healthy', temp: '8.2C', humidity: '82%', freshness: 88, trend: [82, 84, 86, 87, 88] },
]

export const predictionHistory = [
  { period: '24h', risk: 14, confidence: 96 },
  { period: '48h', risk: 21, confidence: 94 },
  { period: '72h', risk: 33, confidence: 92 },
  { period: '7d', risk: 57, confidence: 86 },
]

export const featureImportance = [
  { name: 'Temperature drift', value: 42 },
  { name: 'Humidity envelope', value: 28 },
  { name: 'Packaging integrity', value: 16 },
  { name: 'Harvest age', value: 8 },
  { name: 'Transit dwell time', value: 6 },
]

export const analyticsMetrics = [
  { label: 'Waste prevented', value: '$124K', caption: '30d avoided loss', tone: 'accent2' },
  { label: 'Carbon savings', value: '12.2t', caption: 'Optimized routing', tone: 'accent' },
  { label: 'Revenue protected', value: '$418K', caption: 'Predicted spoilage averted', tone: 'warning' },
]

export const analyticsTrend = [
  { time: 'Jan', spoilage: 132, prevented: 88, temperature: 4.8, humidity: 91 },
  { time: 'Feb', spoilage: 126, prevented: 104, temperature: 4.5, humidity: 90 },
  { time: 'Mar', spoilage: 118, prevented: 128, temperature: 4.4, humidity: 89 },
  { time: 'Apr', spoilage: 109, prevented: 146, temperature: 4.2, humidity: 88 },
  { time: 'May', spoilage: 93, prevented: 174, temperature: 4.1, humidity: 88 },
  { time: 'Jun', spoilage: 82, prevented: 191, temperature: 4.0, humidity: 87 },
]

export const warehouseComparison = [
  { name: 'North', health: 96, delay: 8, waste: 4 },
  { name: 'South', health: 78, delay: 18, waste: 12 },
  { name: 'East', health: 91, delay: 6, waste: 5 },
  { name: 'Port', health: 84, delay: 22, waste: 9 },
  { name: 'Retail', health: 88, delay: 14, waste: 7 },
]

export const produceComparison = [
  { name: 'Tomatoes', risk: 18, turnover: 72 },
  { name: 'Berries', risk: 31, turnover: 64 },
  { name: 'Greens', risk: 26, turnover: 79 },
  { name: 'Dairy', risk: 12, turnover: 86 },
  { name: 'Avocados', risk: 9, turnover: 69 },
]

export const alertCenter = [
  { id: 'ALT-1042', title: 'South Vault humidity above safe threshold', severity: 'Critical', status: 'Unread', source: 'Sensor S-18', time: '2m ago' },
  { id: 'ALT-1039', title: 'Port Gate reefer delay increased to 42 minutes', severity: 'Warning', status: 'Unread', source: 'Route AI', time: '18m ago' },
  { id: 'ALT-1034', title: 'East Cold door open longer than policy', severity: 'Critical', status: 'Read', source: 'Dock 2', time: '44m ago' },
  { id: 'ALT-1028', title: 'North Hub calibration completed', severity: 'Info', status: 'Read', source: 'Probe N-04', time: '1h ago' },
  { id: 'ALT-1022', title: 'Batch 319-KEL requires immediate transfer', severity: 'Critical', status: 'Unread', source: 'Shelf-life model', time: '2h ago' },
]

export const reports = [
  { name: 'Executive Spoilage Summary', type: 'PDF', range: 'Last 30 days', owner: 'Admin', status: 'Ready' },
  { name: 'Warehouse Sensor Audit', type: 'CSV', range: 'This week', owner: 'Operator', status: 'Scheduled' },
  { name: 'Supplier Harvest Variance', type: 'PDF', range: 'Quarterly', owner: 'Manager', status: 'Draft' },
  { name: 'Carbon Savings Ledger', type: 'CSV', range: 'Year to date', owner: 'Admin', status: 'Ready' },
]

export const mlInsights = [
  { factor: 'Temperature drift', impact: '+42%', description: 'Small sustained increases explain most elevated spoilage risk.' },
  { factor: 'Humidity envelope', impact: '+28%', description: 'Berry and greens lots are sensitive to humidity above 90%.' },
  { factor: 'Ethylene exposure', impact: '+17%', description: 'Mixed storage near ripening fruit reduces remaining shelf life.' },
  { factor: 'Transit dwell time', impact: '+9%', description: 'Route holds longer than 2 hours correlate with steeper freshness decay.' },
]

export const settingsGroups = [
  { title: 'Profile', items: ['Name', 'Role', 'Warehouse assignment'] },
  { title: 'API Keys', items: ['Production key', 'Webhook secret', 'Rotation schedule'] },
  { title: 'Notifications', items: ['Critical alerts', 'Daily digest', 'Report delivery'] },
  { title: 'Security', items: ['JWT sessions', 'MFA', 'Role-based access'] },
]

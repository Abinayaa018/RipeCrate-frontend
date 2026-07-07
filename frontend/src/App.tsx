import { Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import PredictionPage from './pages/PredictionPage'
import InventoryPage from './pages/InventoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import CommandPalette from './components/CommandPalette'

function App() {
  return (
    <div className="min-h-screen bg-background text-text">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Topbar />
          <div className="px-6 py-6 lg:px-10 lg:py-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/prediction" element={<PredictionPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}

export default App

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AnalyticsWorkbench from './features/analytics-workbench/AnalyticsWorkbench'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsWorkbench />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

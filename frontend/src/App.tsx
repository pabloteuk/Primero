import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Activity, Search, FileText, BarChart3, Settings, Menu, X } from 'lucide-react'
import { Button } from './components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet'
import { Badge } from './components/ui/badge'
import Dashboard from './components/Dashboard'
import AnalyticsWorkbench from './features/analytics-workbench/AnalyticsWorkbench'
import SupplierSearch from './components/trade/SupplierSearch'
import TradeDealForm from './components/trade/TradeDealForm'
import './index.css'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/suppliers" element={<SupplierSearchPage />} />
        <Route path="/deals" element={<TradeDealPage />} />
        <Route path="/analytics" element={<AnalyticsWorkbench />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  )
}

// Navigation Component
const Navigation: React.FC = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/suppliers', label: 'Suppliers', icon: Search },
    { path: '/deals', label: 'New Deal', icon: FileText },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const NavLink: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    const Icon = item.icon
    const isActive = location.pathname === item.path

    return (
      <Link to={item.path} onClick={() => setMobileMenuOpen(false)}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={`w-full justify-start gap-3 ${
            isActive ? 'bg-white/20 text-white border-white/30' : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-6 left-6 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">Primero</h1>
              <p className="text-gray-300 text-xs">Trade Finance AI</p>
            </div>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-6 right-6 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white/10 border-white/20 hover:bg-white/20">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-slate-900/95 backdrop-blur-xl border-white/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold">Primero</h1>
                <p className="text-gray-300 text-sm">Trade Finance AI</p>
              </div>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">System Status</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Online
                </Badge>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  )
}


// Supplier Search Page
const SupplierSearchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto pt-20 lg:pt-6 lg:ml-80">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Supplier Discovery</h1>
          <p className="text-gray-300 text-lg">
            Find verified suppliers across global markets with real-time compliance data
          </p>
        </div>
        <SupplierSearch />
      </div>
    </div>
  )
}

// Trade Deal Form Page
const TradeDealPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto pt-20 lg:pt-6 lg:ml-80">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Trade Deal</h1>
          <p className="text-gray-300 text-lg">
            Set up a new trade finance transaction with automated compliance and risk assessment
          </p>
        </div>
        <TradeDealForm />
      </div>
    </div>
  )
}

// Settings Page Placeholder
const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto pt-20 lg:pt-6 lg:ml-80">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300 text-lg">
            Configure your trade finance platform preferences
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <p className="text-gray-400">Settings panel coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default App


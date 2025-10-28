import { motion } from 'framer-motion'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import AIInsightsPanel from './components/AIInsightsPanel'
import { useTradeStore } from './store/tradeStore'

function App() {
  const { isLoading } = useTradeStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Main Content */}
        <div className="relative z-10">
          <Hero />
          <Dashboard />
        </div>
        
        {/* AI Insights Panel */}
        <AIInsightsPanel />
        
        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Loading trade intelligence...</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default App

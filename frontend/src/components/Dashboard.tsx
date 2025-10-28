import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTradeStore } from '../store/tradeStore'
import { apiService } from '../services/api'
import { aiInsightsService } from '../services/aiInsights'
import TradeFlowMap from './charts/TradeFlowMap'
import LCTrendsChart from './charts/LCTrendsChart'
import TradeGapChart from './charts/TradeGapChart'
import RegionalFlowsChart from './charts/RegionalFlowsChart'
import LogisticsPerformanceChart from './charts/LogisticsPerformanceChart'
import TopRegionsTable from './data/TopRegionsTable'
import MetricCard from './ui/MetricCard'

const Dashboard: React.FC = () => {
  const {
    setTradeData,
    setRegionData,
    setPredictions,
    setAIInsights,
    setLoading,
    updateLastUpdated,
    regionData,
    predictions
  } = useTradeStore()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      try {
        // Load all data in parallel
        const [tradeData, regionData, predictions] = await Promise.all([
          Promise.resolve(apiService.generateSyntheticTradeData()),
          Promise.resolve(apiService.generateRegionData()),
          Promise.resolve(apiService.generatePredictions())
        ])

        setTradeData(tradeData)
        setRegionData(regionData)
        setPredictions(predictions)
        
        // Start AI insights generation
        aiInsightsService.startInsightGeneration()
        
        // Set up periodic updates
        const interval = setInterval(() => {
          const newInsights = aiInsightsService.getInsights()
          setAIInsights(newInsights)
          updateLastUpdated()
        }, 5000)
        
        updateLastUpdated()
        setLoading(false)
        
        return () => clearInterval(interval)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [setTradeData, setRegionData, setPredictions, setAIInsights, setLoading, updateLastUpdated])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-12"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Global Trade Finance Analytics
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Comprehensive insights into trade flows, letter of credit volumes, and regional performance
            </p>
          </motion.div>

          {/* Key Metrics Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Trade Volume"
              value="$28.5T"
              change={8.2}
              changeType="positive"
              icon="Globe"
              description="Global merchandise trade"
            />
            <MetricCard
              title="Trade Finance Gap"
              value="$1.7T"
              change={-2.1}
              changeType="negative"
              icon="AlertTriangle"
              description="Unmet financing needs"
            />
            <MetricCard
              title="LC Market Size"
              value="$3.2T"
              change={12.5}
              changeType="positive"
              icon="FileText"
              description="Letter of credit volumes"
            />
            <MetricCard
              title="Digital Penetration"
              value="23%"
              change={15.8}
              changeType="positive"
              icon="Zap"
              description="Digital trade finance adoption"
            />
          </motion.div>

          {/* Main Charts Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <TradeFlowMap />
            </div>
            
            <LCTrendsChart />
            <TradeGapChart />
            
            <RegionalFlowsChart />
            <LogisticsPerformanceChart />
          </motion.div>

          {/* Data Tables */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TopRegionsTable />
            
            <div className="chart-container">
              <h3 className="text-2xl font-bold mb-6">Predictive Analytics</h3>
              <div className="space-y-4">
                {predictions.slice(0, 6).map((prediction, index) => (
                  <div key={prediction.date} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {new Date(prediction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg">
                        ${(prediction.predicted / 1e12).toFixed(1)}T
                      </div>
                      <div className="text-sm text-success">
                        +{((prediction.predicted / 28500000000000 - 1) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Dashboard

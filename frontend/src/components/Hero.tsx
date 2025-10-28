import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Globe, Brain, Zap } from 'lucide-react'
import { useTradeStore } from '../store/tradeStore'

const Hero: React.FC = () => {
  const { metrics, setMetrics, updateLastUpdated } = useTradeStore()
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    // Initialize with mock data
    if (!metrics) {
      setMetrics({
        globalTradeVolume: 28500000000000,
        tradeFinanceGap: 1700000000000,
        lcMarketSize: 3200000000000,
        digitalPenetration: 23,
        lastUpdated: new Date().toISOString()
      })
      updateLastUpdated()
    }

    // Animate the counter
    const targetValue = 28500000000000
    const duration = 2000
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setAnimatedValue(targetValue * easeOut)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [metrics, setMetrics, updateLastUpdated])

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="text-gradient">Trade Finance</span>
            <br />
            Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-4xl mx-auto">
            Real-time analytics and AI-powered insights for global trade finance flows
          </p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="glass-card p-8 text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
            <div className="text-3xl font-bold text-text-primary mb-2">
              {formatCurrency(animatedValue)}
            </div>
            <div className="text-text-secondary">Global Trade Volume</div>
          </div>

          <div className="glass-card p-8 text-center">
            <TrendingUp className="w-12 h-12 text-accent mx-auto mb-4" />
            <div className="text-3xl font-bold text-text-primary mb-2">
              {formatCurrency(1700000000000)}
            </div>
            <div className="text-text-secondary">Trade Finance Gap</div>
          </div>

          <div className="glass-card p-8 text-center">
            <Brain className="w-12 h-12 text-success mx-auto mb-4" />
            <div className="text-3xl font-bold text-text-primary mb-2">
              {formatCurrency(3200000000000)}
            </div>
            <div className="text-text-secondary">LC Market Size</div>
          </div>

          <div className="glass-card p-8 text-center">
            <Zap className="w-12 h-12 text-warning mx-auto mb-4" />
            <div className="text-3xl font-bold text-text-primary mb-2">
              23%
            </div>
            <div className="text-text-secondary">Digital Penetration</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="btn-primary text-lg px-8 py-4">
            Explore Dashboard
          </button>
          <button className="btn-secondary text-lg px-8 py-4">
            View API Docs
          </button>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 text-text-secondary text-sm"
        >
          Last updated: {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleString() : 'Loading...'}
        </motion.div>
      </div>
    </section>
  )
}

export default Hero

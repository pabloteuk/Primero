import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, AlertTriangle, Eye, X } from 'lucide-react'
import { useTradeStore } from '../store/tradeStore'
import { AIInsight } from '../types'

const AIInsightsPanel: React.FC = () => {
  const { aiInsights } = useTradeStore()
  const [isOpen, setIsOpen] = useState(true)
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null)
  const [insightIndex, setInsightIndex] = useState(0)

  useEffect(() => {
    if (aiInsights.length > 0 && !currentInsight) {
      setCurrentInsight(aiInsights[0])
    }
  }, [aiInsights, currentInsight])

  useEffect(() => {
    if (aiInsights.length > 0) {
      const interval = setInterval(() => {
        setInsightIndex((prev) => (prev + 1) % aiInsights.length)
        setCurrentInsight(aiInsights[insightIndex])
      }, 8000) // Change insight every 8 seconds

      return () => clearInterval(interval)
    }
  }, [aiInsights, insightIndex])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5" />
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5" />
      case 'prediction':
        return <Brain className="w-5 h-5" />
      case 'risk':
        return <Eye className="w-5 h-5" />
      default:
        return <Brain className="w-5 h-5" />
    }
  }

  const getInsightColor = (type: string, severity: string) => {
    if (severity === 'high') return 'text-error'
    if (type === 'anomaly') return 'text-warning'
    if (type === 'prediction') return 'text-primary'
    if (type === 'trend') return 'text-success'
    return 'text-text-secondary'
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-success/20 text-success border-success/30',
      medium: 'bg-warning/20 text-warning border-warning/30',
      high: 'bg-error/20 text-error border-error/30'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[severity as keyof typeof colors]}`}>
        {severity.toUpperCase()}
      </span>
    )
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed top-1/2 right-6 -translate-y-1/2 z-40 glass-card p-4 hover:bg-white/10 transition-all duration-300"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="w-6 h-6 text-primary" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-6 right-6 w-96 max-h-[calc(100vh-3rem)] z-40 glass-card overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">AI Insights</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Live Analysis</span>
          <span>•</span>
          <span>{aiInsights.length} insights</span>
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {currentInsight && (
            <motion.div
              key={currentInsight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${getInsightColor(currentInsight.type, currentInsight.severity)}`}>
                  {getInsightIcon(currentInsight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{currentInsight.title}</h4>
                    {getSeverityBadge(currentInsight.severity)}
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    {currentInsight.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>
                      Confidence: {(currentInsight.confidence * 100).toFixed(0)}%
                    </span>
                    <span>
                      {new Date(currentInsight.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Insights List */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-sm font-semibold text-text-secondary">Recent Insights</h4>
          {aiInsights.slice(0, 5).map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setCurrentInsight(insight)}
            >
              <div className={`p-1.5 rounded ${getInsightColor(insight.type, insight.severity)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{insight.title}</div>
                <div className="text-xs text-text-secondary">
                  {new Date(insight.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {getSeverityBadge(insight.severity)}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default AIInsightsPanel

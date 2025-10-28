import React from 'react'
import { motion } from 'framer-motion'
import { useTradeStore } from '../../store/tradeStore'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const TopRegionsTable: React.FC = () => {
  const { regionData } = useTradeStore()

  const sortedRegions = [...regionData].sort((a, b) => b.tradeVolume - a.tradeVolume)

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    return `$${value.toLocaleString()}`
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 8) return <TrendingUp className="w-4 h-4 text-success" />
    if (growth < 3) return <TrendingDown className="w-4 h-4 text-error" />
    return <Minus className="w-4 h-4 text-text-secondary" />
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 8) return 'text-success'
    if (growth < 3) return 'text-error'
    return 'text-text-secondary'
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Top Trading Regions</h3>
        <div className="text-sm text-text-secondary">
          Ranked by Trade Volume
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedRegions.map((region, index) => (
          <motion.div
            key={region.code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <div className="font-semibold">{region.name}</div>
                <div className="text-sm text-text-secondary">{region.code}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-mono text-lg">{formatCurrency(region.tradeVolume)}</div>
                <div className="text-sm text-text-secondary">Trade Volume</div>
              </div>
              
              <div className="text-right">
                <div className="font-mono text-lg">{formatCurrency(region.lcVolume)}</div>
                <div className="text-sm text-text-secondary">LC Volume</div>
              </div>
              
              <div className="text-right">
                <div className="font-mono text-lg">{formatCurrency(region.gap)}</div>
                <div className="text-sm text-text-secondary">Finance Gap</div>
              </div>
              
              <div className="flex items-center gap-2">
                {getGrowthIcon(region.growth)}
                <span className={`font-medium ${getGrowthColor(region.growth)}`}>
                  {region.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-text-secondary mb-2">Total Global Volume</div>
            <div className="text-2xl font-bold">
              {formatCurrency(regionData.reduce((sum, r) => sum + r.tradeVolume, 0))}
            </div>
          </div>
          <div>
            <div className="text-sm text-text-secondary mb-2">Average Growth Rate</div>
            <div className="text-2xl font-bold">
              {(regionData.reduce((sum, r) => sum + r.growth, 0) / regionData.length).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TopRegionsTable }

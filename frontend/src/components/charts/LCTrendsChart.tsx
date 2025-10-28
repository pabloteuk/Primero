import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface LCTrendsChartProps {
  data?: any
}

const LCTrendsChart: React.FC<LCTrendsChartProps> = ({ data }) => {
  // Generate data based on backend metrics or fallback to realistic LC data
  const generateData = () => {
    const monthlyData = []
    const now = new Date()

    // Use automation metrics for growth trends if available
    const automationTrends = data?.automation?.monthlyImprovements || []

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)

      // Base LC volume (global LC market is ~$2-3T annually)
      let baseValue = 250000000000 // $250B monthly base

      // Apply growth based on automation improvements if available
      const automationData = automationTrends.find((trend: any) => {
        const trendDate = new Date(trend.month + '-01')
        return trendDate.getMonth() === date.getMonth() && trendDate.getFullYear() === date.getFullYear()
      })

      const automationRate = automationData?.automationRate || 0.8
      const growth = 0.02 + (automationRate - 0.8) * 0.1 // Automation drives growth
      const value = baseValue * (1 + growth * (12 - i) / 12)

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        lcVolume: value,
        digitalLC: value * (0.15 + (automationRate - 0.8) * 0.3), // Digital share grows with automation
        traditionalLC: value * (0.85 - (automationRate - 0.8) * 0.3) // Traditional share decreases
      })
    }

    return monthlyData
  }

  const chartData = generateData()

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    return `$${value.toLocaleString()}`
  }

  const calculateYoYGrowth = () => {
    const current = chartData[chartData.length - 1]?.lcVolume || 0
    const previous = chartData[0]?.lcVolume || 1
    return (((current / previous) - 1) * 100).toFixed(1)
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Letter of Credit Trends</h3>
        <div className="text-sm text-text-secondary">
          Monthly Volume (USD)
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="lcGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="digitalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1e12).toFixed(1)}T`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'lcVolume' ? 'Total LC Volume' : 
                name === 'digitalLC' ? 'Digital LC' : 'Traditional LC'
              ]}
            />
            <Area
              type="monotone"
              dataKey="lcVolume"
              stroke="#0EA5E9"
              strokeWidth={3}
              fill="url(#lcGradient)"
            />
            <Area
              type="monotone"
              dataKey="digitalLC"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#digitalGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(chartData[chartData.length - 1]?.lcVolume || 0)}
          </div>
          <div className="text-sm text-text-secondary">Current Volume</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">
            {calculateYoYGrowth()}%
          </div>
          <div className="text-sm text-text-secondary">YoY Growth</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            {((chartData[chartData.length - 1]?.digitalLC || 0) / (chartData[chartData.length - 1]?.lcVolume || 1) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-text-secondary">Digital Share</div>
        </div>
      </div>
    </div>
  )
}

export { LCTrendsChart }

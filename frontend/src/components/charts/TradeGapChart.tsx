import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TradeGapChartProps {
  data?: any
}

const TradeGapChart: React.FC<TradeGapChartProps> = ({ data }) => {
  // Generate realistic trade finance gap data by region
  const generateTradeGapData = () => {
    const regions = [
      { name: 'Asia-Pacific', code: 'APAC', gap: 890, growth: 8.2 },
      { name: 'Europe', code: 'EU', gap: 650, growth: 5.1 },
      { name: 'North America', code: 'NA', gap: 420, growth: 3.8 },
      { name: 'Latin America', code: 'LATAM', gap: 380, growth: 6.9 },
      { name: 'Middle East', code: 'ME', gap: 290, growth: 7.4 },
      { name: 'Africa', code: 'AFR', gap: 210, growth: 9.1 },
      { name: 'Eastern Europe', code: 'EE', gap: 180, growth: 8.7 },
      { name: 'South Asia', code: 'SA', gap: 350, growth: 8.9 }
    ]

    return regions.map(region => ({
      name: region.code,
      gap: region.gap,
      growth: region.growth,
      fullName: region.name
    }))
  }

  const chartData = generateTradeGapData()

  const getBarColor = (value: number) => {
    if (value > 300) return '#EF4444' // High gap - red
    if (value > 200) return '#F59E0B' // Medium gap - amber
    if (value > 100) return '#10B981' // Low gap - green
    return '#8B5CF6' // Very low gap - purple
  }

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(0)}B`
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Trade Finance Gap by Region</h3>
        <div className="text-sm text-text-secondary">
          Unmet Financing Needs (USD)
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
              tickFormatter={(value) => `$${value}B`}
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
                'Trade Finance Gap'
              ]}
              labelFormatter={(label) => `Region: ${label}`}
            />
            <Bar dataKey="gap" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.gap)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Gap Analysis */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Global Gap</span>
          <span className="text-lg font-bold text-error">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.gap, 0))}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-error rounded" />
              <span>High Risk Regions</span>
            </div>
            <div className="text-text-secondary">
              {chartData.filter(d => d.gap > 300).length} regions
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded" />
              <span>Low Risk Regions</span>
            </div>
            <div className="text-text-secondary">
              {chartData.filter(d => d.gap < 200).length} regions
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TradeGapChart }

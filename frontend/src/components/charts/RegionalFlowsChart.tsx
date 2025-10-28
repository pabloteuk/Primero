import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface RegionalFlowsChartProps {
  data?: any
}

const RegionalFlowsChart: React.FC<RegionalFlowsChartProps> = ({ data }) => {
  // Generate realistic regional trade data
  const generateRegionData = () => {
    return [
      { name: 'Asia-Pacific', tradeVolume: 8500000000000 },
      { name: 'Europe', tradeVolume: 6200000000000 },
      { name: 'North America', tradeVolume: 4800000000000 },
      { name: 'Latin America', tradeVolume: 1200000000000 },
      { name: 'Middle East', tradeVolume: 1800000000000 },
      { name: 'Africa', tradeVolume: 800000000000 },
      { name: 'Eastern Europe', tradeVolume: 950000000000 },
      { name: 'South Asia', tradeVolume: 1500000000000 }
    ]
  }

  const regionData = generateRegionData()
  const chartData = regionData.map(region => ({
    name: region.name,
    value: region.tradeVolume,
    percentage: ((region.tradeVolume / regionData.reduce((sum, r) => sum + r.tradeVolume, 0)) * 100).toFixed(1)
  }))

  const COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Regional Trade Distribution</h3>
        <div className="text-sm text-text-secondary">
          Market Share by Volume
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Trade Volume']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Regional Stats */}
      <div className="mt-6 space-y-3">
        {chartData.map((region, index) => (
          <div key={region.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium">{region.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono">{formatCurrency(region.value)}</div>
              <div className="text-xs text-text-secondary">{region.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export { RegionalFlowsChart }

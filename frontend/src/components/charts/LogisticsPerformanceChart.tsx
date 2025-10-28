import React from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'

const LogisticsPerformanceChart: React.FC = () => {
  // Sample LPI data for different regions
  const data = [
    {
      subject: 'Customs',
      'Asia-Pacific': 3.2,
      'Europe': 3.8,
      'North America': 3.6,
      'Latin America': 2.8,
      'Middle East': 3.1,
      'Africa': 2.5,
    },
    {
      subject: 'Infrastructure',
      'Asia-Pacific': 3.4,
      'Europe': 4.1,
      'North America': 3.9,
      'Latin America': 2.6,
      'Middle East': 3.3,
      'Africa': 2.2,
    },
    {
      subject: 'International Shipments',
      'Asia-Pacific': 3.6,
      'Europe': 4.0,
      'North America': 3.8,
      'Latin America': 2.9,
      'Middle East': 3.2,
      'Africa': 2.4,
    },
    {
      subject: 'Logistics Quality',
      'Asia-Pacific': 3.3,
      'Europe': 3.9,
      'North America': 3.7,
      'Latin America': 2.7,
      'Middle East': 3.0,
      'Africa': 2.3,
    },
    {
      subject: 'Tracking & Tracing',
      'Asia-Pacific': 3.5,
      'Europe': 4.2,
      'North America': 4.0,
      'Latin America': 2.8,
      'Middle East': 3.4,
      'Africa': 2.6,
    },
    {
      subject: 'Timeliness',
      'Asia-Pacific': 3.1,
      'Europe': 3.7,
      'North America': 3.5,
      'Latin America': 2.5,
      'Middle East': 2.9,
      'Africa': 2.1,
    },
  ]

  const COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Logistics Performance Index</h3>
        <div className="text-sm text-text-secondary">
          Regional Comparison (1-5 Scale)
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 5]}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
            />
            <Radar
              name="Asia-Pacific"
              dataKey="Asia-Pacific"
              stroke="#0EA5E9"
              fill="#0EA5E9"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name="Europe"
              dataKey="Europe"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name="North America"
              dataKey="North America"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-primary">3.4</div>
          <div className="text-sm text-text-secondary">Global Average</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-accent">4.1</div>
          <div className="text-sm text-text-secondary">Best Region (Europe)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-warning">2.3</div>
          <div className="text-sm text-text-secondary">Needs Improvement</div>
        </div>
      </div>
    </div>
  )
}

export { LogisticsPerformanceChart }

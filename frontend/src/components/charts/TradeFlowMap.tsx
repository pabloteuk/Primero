import React from 'react'
import { motion } from 'framer-motion'

interface TradeFlowMapProps {
  data?: any
}

const TradeFlowMap: React.FC<TradeFlowMapProps> = ({ data }) => {
  // Generate realistic global trade data
  const generateRegionData = () => {
    return [
      { name: 'Asia-Pacific', code: 'APAC', tradeVolume: 8500000000000, lat: 35, lng: 105 },
      { name: 'Europe', code: 'EU', tradeVolume: 6200000000000, lat: 50, lng: 10 },
      { name: 'North America', code: 'NA', tradeVolume: 4800000000000, lat: 40, lng: -100 },
      { name: 'Latin America', code: 'LATAM', tradeVolume: 1200000000000, lat: -15, lng: -60 },
      { name: 'Middle East', code: 'ME', tradeVolume: 1800000000000, lat: 25, lng: 45 },
      { name: 'Africa', code: 'AFR', tradeVolume: 800000000000, lat: 0, lng: 20 },
      { name: 'Eastern Europe', code: 'EE', tradeVolume: 950000000000, lat: 55, lng: 30 },
      { name: 'South Asia', code: 'SA', tradeVolume: 1500000000000, lat: 20, lng: 80 }
    ]
  }

  const regionData = generateRegionData()
  const maxVolume = Math.max(...regionData.map(r => r.tradeVolume))
  
  const getRegionColor = (volume: number) => {
    const intensity = volume / maxVolume
    if (intensity > 0.8) return 'fill-primary'
    if (intensity > 0.6) return 'fill-primary/80'
    if (intensity > 0.4) return 'fill-primary/60'
    if (intensity > 0.2) return 'fill-primary/40'
    return 'fill-primary/20'
  }

  const getRegionSize = (volume: number) => {
    const intensity = volume / maxVolume
    return 20 + intensity * 40 // 20-60px radius
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Global Trade Flows</h3>
        <div className="text-sm text-text-secondary">
          Volume by Region (USD)
        </div>
      </div>
      
      <div className="relative h-96 bg-gradient-to-br from-background-secondary/50 to-background/50 rounded-xl overflow-hidden">
        {/* Simplified World Map Representation */}
        <svg viewBox="0 0 800 400" className="w-full h-full">
          {/* Background */}
          <rect width="800" height="400" fill="url(#mapGradient)" />
          
          {/* Region Circles */}
          {regionData.map((region, index) => {
            const positions = [
              { x: 200, y: 100 }, // Asia-Pacific
              { x: 300, y: 80 },  // Europe
              { x: 150, y: 120 }, // North America
              { x: 250, y: 200 }, // Latin America
              { x: 400, y: 150 }, // Middle East
              { x: 350, y: 250 }  // Africa
            ]
            
            const pos = positions[index] || { x: 400, y: 200 }
            const size = getRegionSize(region.tradeVolume)
            
            return (
              <motion.g
                key={region.code}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size}
                  className={getRegionColor(region.tradeVolume)}
                  opacity={0.8}
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-text-primary"
                >
                  {region.code}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 16}
                  textAnchor="middle"
                  className="text-xs fill-text-secondary"
                >
                  ${(region.tradeVolume / 1e12).toFixed(1)}T
                </text>
              </motion.g>
            )
          })}
          
          {/* Trade Flow Lines */}
          <motion.path
            d="M 200 100 Q 250 90 300 80"
            stroke="url(#flowGradient)"
            strokeWidth="3"
            fill="none"
            opacity={0.6}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          <motion.path
            d="M 150 120 Q 200 110 250 200"
            stroke="url(#flowGradient)"
            strokeWidth="2"
            fill="none"
            opacity={0.4}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.2 }}
          />
        </svg>
        
        {/* Gradient Definitions */}
        <svg width="0" height="0">
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f2744" />
              <stop offset="100%" stopColor="#0a1628" />
            </linearGradient>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>High Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/40 rounded-full" />
            <span>Medium Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/20 rounded-full" />
            <span>Low Volume</span>
          </div>
        </div>
        <div className="text-text-secondary">
          Total: ${regionData.reduce((sum, r) => sum + r.tradeVolume, 0) / 1e12}T
        </div>
      </div>
    </div>
  )
}

export { TradeFlowMap }

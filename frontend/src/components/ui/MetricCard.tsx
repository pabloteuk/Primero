import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: string
  description: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  description
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success'
      case 'negative':
        return 'text-error'
      default:
        return 'text-text-secondary'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '↗'
      case 'negative':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="metric-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <div className="text-2xl text-primary">
          {/* Icon would be rendered here based on icon prop */}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold text-text-primary font-mono">
          {value}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {getChangeIcon()} {Math.abs(change)}%
          </span>
          <span className="text-xs text-text-secondary">vs last month</span>
        </div>
        
        <p className="text-sm text-text-secondary">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default MetricCard

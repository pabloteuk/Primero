import React from 'react'

interface ProgressProps {
  value?: number
  className?: string
  max?: number
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  className = '',
  max = 100
}) => {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - (value / max) * 100}%)` }}
      />
    </div>
  )
}

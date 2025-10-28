import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 ${className}`}>
    {children}
  </div>
)

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
)

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-white ${className}`}>
    {children}
  </h3>
)

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-sm text-white/60 ${className}`}>
    {children}
  </p>
)

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
)

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'outline'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default'
}) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'

  const variantClasses = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-white/10 text-white',
    outline: 'border border-white/20 text-white'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

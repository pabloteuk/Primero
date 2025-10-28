import React, { useState } from 'react'

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  children: React.ReactNode
  value: string
  className?: string
}

interface TabsContentProps {
  children: React.ReactNode
  value: string
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({ children, defaultValue, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || '')

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, { activeTab, setActiveTab })
          : child
      )}
    </div>
  )
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => (
  <div className={`flex space-x-1 bg-white/5 rounded-lg p-1 ${className}`}>
    {children}
  </div>
)

export const TabsTrigger: React.FC<TabsTriggerProps & { activeTab?: string; setActiveTab?: (value: string) => void }> = ({
  children,
  value,
  className = '',
  activeTab,
  setActiveTab
}) => {
  const isActive = activeTab === value

  return (
    <button
      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      } ${className}`}
      onClick={() => setActiveTab?.(value)}
    >
      {children}
    </button>
  )
}

export const TabsContent: React.FC<TabsContentProps & { activeTab?: string }> = ({
  children,
  value,
  className = '',
  activeTab
}) => {
  if (activeTab !== value) return null

  return (
    <div className={className}>
      {children}
    </div>
  )
}

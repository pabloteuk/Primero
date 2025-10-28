import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectValueProps {
  placeholder?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
}

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (newValue: string) => {
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement, {
              isOpen,
              setIsOpen,
              value,
              onSelect: handleSelect
            })
          : child
      )}
    </div>
  )
}

export const SelectTrigger: React.FC<SelectTriggerProps & {
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  value?: string
}> = ({
  children,
  className = '',
  isOpen,
  setIsOpen,
  value
}) => {
  return (
    <button
      type="button"
      onClick={() => setIsOpen?.(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span className="truncate">
        {React.Children.map(children, (child) =>
          React.isValidElement(child) && child.type === SelectValue
            ? React.cloneElement(child as React.ReactElement, { value })
            : child
        )}
      </span>
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  )
}

export const SelectValue: React.FC<SelectValueProps & { value?: string }> = ({
  placeholder = 'Select an option',
  value
}) => {
  return (
    <span className="truncate">
      {value || placeholder}
    </span>
  )
}

export const SelectContent: React.FC<SelectContentProps & {
  isOpen?: boolean
}> = ({
  children,
  isOpen
}) => {
  if (!isOpen) return null

  return (
    <div className="absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border border-white/20 bg-black/95 backdrop-blur-sm p-1 shadow-lg">
      <div className="max-h-60 overflow-auto py-1">
        {children}
      </div>
    </div>
  )
}

export const SelectItem: React.FC<SelectItemProps & {
  onSelect?: (value: string) => void
}> = ({
  children,
  value,
  onSelect
}) => {
  return (
    <div
      onClick={() => onSelect?.(value)}
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-white outline-none hover:bg-white/10 focus:bg-white/10"
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-current opacity-50" />
      </span>
      {children}
    </div>
  )
}

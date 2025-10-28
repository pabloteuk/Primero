import React from 'react'

interface TextareaProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  rows?: number
}

export const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  onChange,
  className = '',
  rows = 3
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`flex min-h-[80px] w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  )
}

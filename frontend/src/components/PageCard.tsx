import React from 'react'

interface PageCardProps {
  maxWidth?: number
  children: React.ReactNode
  className?: string
}

export default function PageCard({ maxWidth = 480, children, className = '' }: PageCardProps) {
  return (
    <div
      className={['page-card', className].filter(Boolean).join(' ')}
      style={{ width: `min(100%, ${maxWidth}px)` }}
    >
      {children}
    </div>
  )
}

import React from 'react'

interface PageCardProps {
  maxWidth?: 480 | 1100
  children: React.ReactNode
  className?: string
}

export default function PageCard({ maxWidth = 480, children, className = '' }: PageCardProps) {
  const widthClass = maxWidth === 1100 ? 'page-card--wide' : ''

  return (
    <div className={['page-card', widthClass, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

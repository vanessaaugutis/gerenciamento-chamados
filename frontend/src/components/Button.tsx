import React from 'react'

type ButtonVariant = 'primary' | 'danger' | 'warning' | 'secondary' | 'teal' | 'cancel'
type ButtonSize = 'md' | 'sm'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'btn btn--primary',
  danger:    'btn btn--danger',
  warning:   'btn btn--warning',
  secondary: 'btn btn--secondary',
  teal:      'btn btn--teal',
  cancel:    'btn btn--cancel',
}

const sizeStyles: Record<ButtonSize, string> = {
  md: 'btn--md',
  sm: 'btn--sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [variantStyles[variant], sizeStyles[size], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

import React from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export default function FormField({ label, required, children, className = '' }: FormFieldProps) {
  return (
    <label className={['form-field', className].filter(Boolean).join(' ')}>
      <span className="form-field__label">
        {label}
        {required ? <span className="required-mark">*</span> : null}
      </span>
      {children}
    </label>
  )
}

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className = '', ...props }: InputProps) {
  return <input className={['form-input', className].filter(Boolean).join(' ')} {...props} />
}

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClass = `acp-btn acp-btn--${variant}`

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  )
}

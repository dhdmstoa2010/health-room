import type { ButtonHTMLAttributes } from 'react'

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: 'none',
        background: '#2563eb',
        color: '#fff',
        cursor: 'pointer',
        ...props.style,
      }}
    />
  )
}

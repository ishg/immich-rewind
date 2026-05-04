'use client'

import { useEffect, useState } from 'react'
import { ToastType } from '@/lib/types'

interface Props {
  message: string
  type: ToastType
}

export default function Toast({ message, type }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none whitespace-nowrap
        px-4 py-2.5 rounded-full text-sm border bg-surface
        transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}
        ${type === 'success' ? 'border-success/40 text-success' : ''}
        ${type === 'error' ? 'border-danger/40 text-danger' : ''}
        ${type === 'default' ? 'border-border text-fg' : ''}`}
    >
      {message}
    </div>
  )
}

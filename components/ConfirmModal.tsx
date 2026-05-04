'use client'

import { useEffect } from 'react'

interface Props {
  open: boolean
  count: number
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, count, onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="bg-surface border border-border rounded-2xl p-7 max-w-sm w-[90%] animate-fadeUp"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display text-[22px] mb-2 text-fg">Delete photos?</h3>
        <p className="text-muted text-sm leading-relaxed mb-6">
          This will move <strong className="text-fg">{count} photo{count !== 1 ? 's' : ''}</strong> to
          the Immich trash. You can recover them from there if needed.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface2 border border-border text-sm hover:border-accent hover:text-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-danger/15 border border-danger/30 text-danger text-sm hover:bg-danger/25 transition-colors"
          >
            Move to trash
          </button>
        </div>
      </div>
    </div>
  )
}

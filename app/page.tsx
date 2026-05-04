'use client'

import { useState, useCallback, useEffect } from 'react'
import { Photo, ToastType } from '@/lib/types'
import Header from '@/components/Header'
import BulkMode from '@/components/BulkMode'
import ConfirmModal from '@/components/ConfirmModal'
import Toast from '@/components/Toast'
import SetupError from '@/components/SetupError'

interface ToastState {
  msg: string
  type: ToastType
  key: number
}

type AppError = { type: 'not_configured'; missing: string[] } | { type: 'unreachable' | 'unauthorized' }

export default function Home() {
  const today = new Date()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [marked, setMarked] = useState<Set<string>>(new Set())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [day, setDay] = useState(today.getDate())
  const [loading, setLoading] = useState(false)
  const [appError, setAppError] = useState<AppError | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((msg: string, type: ToastType = 'default') => {
    setToast({ msg, type, key: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadPhotos = useCallback(async (m: number, d: number) => {
    setLoading(true)
    setAppError(null)
    setPhotos([])
    setMarked(new Set())

    try {
      const currentYear = new Date().getFullYear()
      const mm = String(m).padStart(2, '0')
      const dd = String(d).padStart(2, '0')

      // Probe with a single request first so we can detect config/auth errors
      // before firing all parallel year requests.
      const probe = await fetch('/api/immich/search/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          takenAfter: new Date(`${currentYear}-${mm}-${dd}T00:00:00`).toISOString(),
          takenBefore: new Date(`${currentYear}-${mm}-${dd}T23:59:59.999`).toISOString(),
          withExif: false, page: 1, size: 1,
        }),
      }).catch(() => null)

      if (!probe) {
        setAppError({ type: 'unreachable' })
        return
      }
      if (probe.status === 503) {
        const body = await probe.json().catch(() => ({})) as Record<string, unknown>
        if (body.error === 'not_configured') {
          setAppError({ type: 'not_configured', missing: (body.missing as string[]) ?? [] })
          return
        }
      }
      if (probe.status === 401) {
        setAppError({ type: 'unauthorized' })
        return
      }

      // Query every year in parallel — memories endpoint only returns years
      // where Immich generated a memory entry, which misses most years.
      const years = Array.from({ length: currentYear - 2012 + 1 }, (_, i) => 2012 + i)
      const responses = await Promise.all(
        years.map(year =>
          fetch('/api/immich/search/metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              takenAfter: new Date(`${year}-${mm}-${dd}T00:00:00`).toISOString(),
              takenBefore: new Date(`${year}-${mm}-${dd}T23:59:59.999`).toISOString(),
              withExif: false,
              page: 1,
              size: 1000,
            }),
          }).then(r => r.ok ? r.json().catch(() => ({} as Record<string, unknown>)) : {} as Record<string, unknown>)
        )
      )

      const seen = new Set<string>()
      const raw: Record<string, unknown>[] = []

      for (const data of responses) {
        for (const a of (data?.assets?.items ?? [])) {
          if (!seen.has(a.id as string)) { seen.add(a.id as string); raw.push(a) }
        }
      }

      raw.sort((a, b) => {
        const at = (a.fileCreatedAt || a.localDateTime || '') as string
        const bt = (b.fileCreatedAt || b.localDateTime || '') as string
        return at > bt ? -1 : at < bt ? 1 : 0
      })

      setPhotos(raw.map(a => ({
        id: a.id as string,
        filename: (a.originalFileName as string) || (a.id as string),
        takenAt: (a.fileCreatedAt as string) || (a.localDateTime as string) || '',
        thumbUrl: `/api/immich/assets/${a.id}/thumbnail?size=preview`,
        type: ((a.type as string) === 'VIDEO' ? 'VIDEO' : 'IMAGE') as 'IMAGE' | 'VIDEO',
      })))
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to load photos', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadPhotos(today.getMonth() + 1, today.getDate())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDayChange = useCallback((m: number, d: number) => {
    setMonth(m)
    setDay(d)
    loadPhotos(m, d)
  }, [loadPhotos])

  const toggleMark = useCallback((id: string) => {
    setMarked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setMarked(prev =>
      prev.size === photos.length ? new Set() : new Set(photos.map(p => p.id))
    )
  }, [photos])

  const deleteMarked = useCallback(async () => {
    const ids = [...marked]
    setConfirmOpen(false)
    showToast(`Deleting ${ids.length} photo${ids.length !== 1 ? 's' : ''}…`)

    try {
      const res = await fetch('/api/immich/assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, force: false }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { message?: string }).message || `Delete failed: ${res.status}`)
      }

      setPhotos(prev => prev.filter(p => !marked.has(p.id)))
      setMarked(new Set())
      showToast(`Moved ${ids.length} photo${ids.length !== 1 ? 's' : ''} to trash`, 'success')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Delete failed', 'error')
    }
  }, [marked, showToast])

  return (
    <div className="min-h-screen bg-bg">
      <Header
        month={month}
        day={day}
        onDayChange={handleDayChange}
        photoCount={photos.length}
        markedCount={marked.size}
        loading={loading}
      />

      {loading && (
        <div className="flex items-center justify-center gap-3 py-24 text-muted">
          <div className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin" />
          <span className="font-mono text-sm">Loading photos…</span>
        </div>
      )}

      {!loading && appError && (
        <SetupError type={appError.type} missing={'missing' in appError ? appError.missing : undefined} />
      )}

      {!loading && !appError && (
        <BulkMode
          photos={photos}
          marked={marked}
          onToggleMark={toggleMark}
          onSelectAll={selectAll}
          onDeleteRequest={() => setConfirmOpen(true)}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        count={marked.size}
        onConfirm={deleteMarked}
        onCancel={() => setConfirmOpen(false)}
      />

      {toast && <Toast key={toast.key} message={toast.msg} type={toast.type} />}
    </div>
  )
}

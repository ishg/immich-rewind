'use client'

import { useEffect } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon, CheckIcon, ArrowTopRightOnSquareIcon, PlayIcon } from '@heroicons/react/24/solid'
import { Photo } from '@/lib/types'

const IMMICH_URL = (process.env.NEXT_PUBLIC_IMMICH_URL ?? '').replace(/\/$/, '')

interface Props {
  photo: Photo
  isMarked: boolean
  onToggleMark: () => void
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export default function Lightbox({ photo, isMarked, onToggleMark, onClose, onPrev, onNext }: Props) {
  const isVideo = photo.type === 'VIDEO'
  const immichLink = IMMICH_URL ? `${IMMICH_URL}/photos/${photo.id}` : null

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
      if (e.key === 'd' || e.key === 'D') onToggleMark()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext, onToggleMark])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-lg p-5"
      onClick={onClose}
    >
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        {immichLink && (
          <a
            href={immichLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            title="Open in Immich"
          >
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            Immich
          </a>
        )}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Prev */}
      {onPrev && (
        <button
          onClick={e => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      {/* Next */}
      {onNext && (
        <button
          onClick={e => { e.stopPropagation(); onNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}

      {/* Media */}
      <div onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video
            src={`/api/immich/assets/${photo.id}/video/playback`}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          />
        ) : (
          <img
            src={photo.thumbUrl}
            alt={photo.filename}
            className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          />
        )}
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <button
          onClick={onToggleMark}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all
            ${isMarked
              ? 'bg-danger/35 border-danger/50 text-danger'
              : 'bg-black/50 border-white/20 text-white hover:bg-danger/20 hover:border-danger/40 hover:text-danger'
            }`}
        >
          {isMarked
            ? <><CheckIcon className="w-4 h-4" />Unmark for deletion</>
            : <><TrashIcon className="w-4 h-4" />Mark for deletion</>
          }
        </button>
        <p className="text-[11px] text-white/35">Press D to toggle · ← → to navigate</p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { CheckIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/solid'
import { CameraIcon } from '@heroicons/react/24/outline'
import { Photo } from '@/lib/types'
import Lightbox from './Lightbox'

interface Props {
  photos: Photo[]
  marked: Set<string>
  immichUrl: string
  onToggleMark: (id: string) => void
  onSelectAll: () => void
  onDeleteRequest: () => void
}

export default function BulkMode({ photos, marked, immichUrl, onToggleMark, onSelectAll, onDeleteRequest }: Props) {
  const [lbIdx, setLbIdx] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <CameraIcon className="w-14 h-14 opacity-20" />
        <h3 className="font-display text-2xl text-fg">No photos found</h3>
        <p className="text-sm text-muted">No images were taken on this day in your library.</p>
      </div>
    )
  }

  const allSelected = photos.length > 0 && marked.size === photos.length

  // Group by year, newest first
  const byYear = photos.reduce<Record<string, { photo: Photo; globalIdx: number }[]>>((acc, photo, i) => {
    const year = photo.takenAt ? new Date(photo.takenAt).getFullYear().toString() : 'Unknown'
    if (!acc[year]) acc[year] = []
    acc[year].push({ photo, globalIdx: i })
    return acc
  }, {})
  const years = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <>
      {/* Sub-toolbar */}
      <div className="flex items-center gap-3 px-5 h-12 bg-surface border-b border-border">
        <button onClick={onSelectAll} className="text-xs font-mono text-accent hover:underline shrink-0">
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-border text-xs hidden sm:block">·</span>
        <span className="text-xs text-muted font-mono hidden sm:block">Click photo to open · click circle to mark</span>
        {marked.size > 0 && (
          <button
            onClick={onDeleteRequest}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-danger/15 border border-danger/30 text-danger text-sm hover:bg-danger/25 transition-colors"
          >
            <TrashIcon className="w-4 h-4" /> Delete {marked.size}
          </button>
        )}
      </div>

      {/* Grid grouped by year */}
      <div className="p-4 sm:p-5 space-y-8">
        {years.map(year => (
          <div key={year}>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-display text-lg text-fg">{year}</span>
              <span className="text-xs font-mono text-muted">{byYear[year].length} photo{byYear[year].length !== 1 ? 's' : ''}</span>
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
            >
              {byYear[year].map(({ photo, globalIdx }) => {
                const sel = marked.has(photo.id)
                return (
                  <div
                    key={photo.id}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-surface2 border-2 transition-all duration-150 group cursor-pointer
                      ${sel ? 'border-danger' : 'border-transparent hover:scale-[1.02]'}`}
                    style={sel ? { boxShadow: '0 0 0 1px rgb(232 106 106)' } : undefined}
                    onClick={() => setLbIdx(globalIdx)}
                  >
                    <img
                      src={photo.thumbUrl}
                      alt={photo.filename}
                      loading="lazy"
                      className="w-full h-full object-cover pointer-events-none"
                      onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                    />

                    {/* Video indicator */}
                    {photo.type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Checkbox — click to mark/unmark */}
                    <button
                      className="absolute top-1.5 right-1.5"
                      onClick={e => { e.stopPropagation(); onToggleMark(photo.id) }}
                      title={sel ? 'Unmark' : 'Mark for deletion'}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all
                          ${sel
                            ? 'bg-danger border-danger'
                            : 'bg-black/40 border-white/50 opacity-40 group-hover:opacity-100'
                          }`}
                      >
                        {sel && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>

                    {/* Time pill (hover) */}
                    {photo.takenAt && (
                      <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white/70 text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {new Date(photo.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {lbIdx !== null && (
        <Lightbox
          photo={photos[lbIdx]}
          isMarked={marked.has(photos[lbIdx].id)}
          immichUrl={immichUrl}
          onToggleMark={() => onToggleMark(photos[lbIdx].id)}
          onClose={() => setLbIdx(null)}
          onPrev={lbIdx > 0 ? () => setLbIdx(n => n! - 1) : undefined}
          onNext={lbIdx < photos.length - 1 ? () => setLbIdx(n => n! + 1) : undefined}
        />
      )}
    </>
  )
}

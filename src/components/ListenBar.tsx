import { useRef, useState } from 'react'
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MinusIcon,
} from '@heroicons/react/24/solid'
import { useListen } from './ListenContext'
import { useAppStore } from '../store/useAppStore'
import type { TeachingStyle } from '../lib/types'

const STYLE_OPTIONS: { value: TeachingStyle; label: string }[] = [
  { value: 'read-exactly', label: 'Read exactly' },
  { value: 'explain-simply', label: 'Explain simply' },
  { value: 'teach-professor', label: 'Teach like a professor' },
  { value: 'exam-review', label: 'Exam review' },
  { value: 'clinical-explanation', label: 'Clinical explanation' },
  { value: 'quick-review', label: 'Quick review' },
]

export function ListenBar() {
  const { isOpen, isLoading, isPlaying, error, currentLabel, queue, close, togglePlayPause, next, previous, repeat } =
    useListen()
  const { audioSpeed, setAudioSpeed, teachingStyle, setTeachingStyle } = useAppStore()
  const [expanded, setExpanded] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null)
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(
    null
  )

  if (!isOpen) return null

  function defaultBubblePos() {
    if (typeof window === 'undefined') return { x: 16, y: 120 }
    return { x: window.innerWidth - 76, y: window.innerHeight - 220 }
  }

  function onDragStart(clientX: number, clientY: number) {
    const pos = bubblePos ?? defaultBubblePos()
    dragState.current = { startX: clientX, startY: clientY, origX: pos.x, origY: pos.y, moved: false }
  }

  function onDragMove(clientX: number, clientY: number) {
    if (!dragState.current) return
    const dx = clientX - dragState.current.startX
    const dy = clientY - dragState.current.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.current.moved = true
    const maxX = window.innerWidth - 60
    const maxY = window.innerHeight - 60
    setBubblePos({
      x: Math.min(Math.max(0, dragState.current.origX + dx), maxX),
      y: Math.min(Math.max(0, dragState.current.origY + dy), maxY),
    })
  }

  function onDragEnd() {
    const moved = dragState.current?.moved
    dragState.current = null
    return moved
  }

  if (minimized) {
    const pos = bubblePos ?? defaultBubblePos()
    return (
      <div
        className="fixed z-50 touch-none select-none"
        style={{ left: pos.x, top: pos.y }}
        onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          if (dragState.current) onDragMove(e.clientX, e.clientY)
        }}
        onMouseUp={() => onDragEnd()}
        onMouseLeave={() => dragState.current && onDragEnd()}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={() => onDragEnd()}
      >
        <button
          onClick={() => {
            if (!onDragEnd()) setMinimized(false)
          }}
          aria-label="Restore listen player"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-xl shadow-brand-500/40"
        >
          {isLoading ? (
            <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
          ) : isPlaying ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6 translate-x-0.5" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-4 inset-x-0 z-50 flex justify-center px-3">
      <div className="w-full max-w-lg glass-panel rounded-[28px] shadow-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse listen controls' : 'Expand listen controls'}
            className="flex flex-1 items-center gap-2 text-left"
          >
            {expanded ? <ChevronDownIcon className="h-4 w-4 text-slate-400" /> : <ChevronUpIcon className="h-4 w-4 text-slate-400" />}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{currentLabel ?? 'AI Listen'}</p>
              <p className="text-xs text-slate-500">
                {isLoading ? 'Generating narration…' : error ? error : isPlaying ? 'Playing' : 'Paused'}
              </p>
            </div>
          </button>

          <button
            onClick={previous}
            disabled={!queue.length}
            aria-label="Previous"
            className="p-1.5 text-slate-500 disabled:opacity-30"
          >
            <BackwardIcon className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-300/40 disabled:opacity-50"
          >
            {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5 translate-x-0.5" />}
          </button>
          <button onClick={next} aria-label="Next" className="p-1.5 text-slate-500">
            <ForwardIcon className="h-5 w-5" />
          </button>
          <button onClick={repeat} aria-label="Repeat" className="p-1.5 text-slate-500">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            aria-label="Minimize player"
            className="p-1.5 text-slate-400"
          >
            <MinusIcon className="h-5 w-5" />
          </button>
          <button onClick={close} aria-label="Close player" className="p-1.5 text-slate-400">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {expanded && (
          <div className="space-y-3 border-t border-orange-100 px-4 py-3 dark:border-white/10">
            <div>
              <label className="text-xs font-medium text-slate-500">Teaching style</label>
              <select
                value={teachingStyle}
                onChange={(e) => setTeachingStyle(e.target.value as TeachingStyle)}
                className="mt-1 w-full rounded-lg border border-orange-100 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Speed: {audioSpeed.toFixed(2)}x</label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.25}
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

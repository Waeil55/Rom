import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { generateSpeech, type ListenResult } from '../lib/listen'
import { useAppStore } from '../store/useAppStore'
import type { TeachingStyle } from '../lib/types'

interface QueueItem {
  label: string
  text: string
}

interface ListenContextValue {
  isOpen: boolean
  isLoading: boolean
  isPlaying: boolean
  error: string | null
  currentLabel: string | null
  currentIndex: number
  queue: QueueItem[]
  autoAdvance: boolean
  setAutoAdvance: (v: boolean) => void
  play: (items: QueueItem[], startIndex?: number) => void
  close: () => void
  togglePlayPause: () => void
  next: () => void
  previous: () => void
  repeat: () => void
}

const ListenCtx = createContext<ListenContextValue | null>(null)

export function ListenProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [index, setIndex] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prefetchCache = useRef<Map<number, Promise<ListenResult>>>(new Map())
  const { audioSpeed, teachingStyle, voice } = useAppStore()

  const requestSpeech = useCallback(
    (items: QueueItem[], i: number, style: TeachingStyle) => {
      const item = items[i]
      if (!item) return null
      return generateSpeech(item.text, style, voice, 1)
    },
    [voice]
  )

  const prefetchNext = useCallback(
    (items: QueueItem[], i: number, style: TeachingStyle) => {
      const nextIndex = i + 1
      if (nextIndex >= items.length || prefetchCache.current.has(nextIndex)) return
      const promise = requestSpeech(items, nextIndex, style)
      if (promise) prefetchCache.current.set(nextIndex, promise)
    },
    [requestSpeech]
  )

  const speak = useCallback(
    async (items: QueueItem[], i: number, style: TeachingStyle, autoplayNext: () => void) => {
      const item = items[i]
      if (!item) return
      setIsLoading(true)
      setError(null)
      try {
        const cached = prefetchCache.current.get(i)
        prefetchCache.current.delete(i)
        const result = cached ? await cached : await requestSpeech(items, i, style)
        if (!result) return
        if (audioRef.current) {
          audioRef.current.pause()
        }
        const audio = new Audio(result.audioUrl)
        audio.playbackRate = audioSpeed
        audio.onended = () => {
          setIsPlaying(false)
          autoplayNext()
        }
        audioRef.current = audio
        await audio.play()
        setIsPlaying(true)
        setIsLoading(false)
        // Start generating the next track now so it's ready the instant this one ends —
        // essential for hands-free/drive listening with no gap between items.
        prefetchNext(items, i, style)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate audio.')
        setIsPlaying(false)
        setIsLoading(false)
      }
    },
    [audioSpeed, requestSpeech, prefetchNext]
  )

  const goTo = useCallback(
    (items: QueueItem[], targetIndex: number) => {
      setIndex(targetIndex)
      void speak(items, targetIndex, teachingStyle, () => {
        if (autoAdvance && targetIndex + 1 < items.length) {
          goTo(items, targetIndex + 1)
        }
      })
    },
    [speak, teachingStyle, autoAdvance]
  )

  const play = useCallback(
    (items: QueueItem[], startIndex = 0) => {
      prefetchCache.current.clear()
      setQueue(items)
      setIsOpen(true)
      goTo(items, startIndex)
    },
    [goTo]
  )

  const close = useCallback(() => {
    audioRef.current?.pause()
    prefetchCache.current.clear()
    setIsOpen(false)
    setIsPlaying(false)
  }, [])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      void audioRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const next = useCallback(() => {
    const nextIndex = index + 1
    if (nextIndex < queue.length) goTo(queue, nextIndex)
  }, [index, queue, goTo])

  const previous = useCallback(() => {
    const prevIndex = index - 1
    if (prevIndex >= 0) goTo(queue, prevIndex)
  }, [index, queue, goTo])

  const repeat = useCallback(() => {
    goTo(queue, index)
  }, [index, queue, goTo])

  return (
    <ListenCtx.Provider
      value={{
        isOpen,
        isLoading,
        isPlaying,
        error,
        currentLabel: queue[index]?.label ?? null,
        currentIndex: index,
        queue,
        autoAdvance,
        setAutoAdvance,
        play,
        close,
        togglePlayPause,
        next,
        previous,
        repeat,
      }}
    >
      {children}
    </ListenCtx.Provider>
  )
}

export function useListen() {
  const ctx = useContext(ListenCtx)
  if (!ctx) throw new Error('useListen must be used within ListenProvider')
  return ctx
}

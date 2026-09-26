import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { generateSpeech } from '../lib/listen'
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
  queue: QueueItem[]
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { audioSpeed, teachingStyle } = useAppStore()

  const speak = useCallback(
    async (items: QueueItem[], i: number, style: TeachingStyle) => {
      const item = items[i]
      if (!item) return
      setIsLoading(true)
      setError(null)
      try {
        const { audioUrl } = await generateSpeech(item.text, style)
        if (audioRef.current) {
          audioRef.current.pause()
        }
        const audio = new Audio(audioUrl)
        audio.playbackRate = audioSpeed
        audio.onended = () => setIsPlaying(false)
        audioRef.current = audio
        await audio.play()
        setIsPlaying(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate audio.')
        setIsPlaying(false)
      } finally {
        setIsLoading(false)
      }
    },
    [audioSpeed]
  )

  const play = useCallback(
    (items: QueueItem[], startIndex = 0) => {
      setQueue(items)
      setIndex(startIndex)
      setIsOpen(true)
      void speak(items, startIndex, teachingStyle)
    },
    [speak, teachingStyle]
  )

  const close = useCallback(() => {
    audioRef.current?.pause()
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
    if (nextIndex < queue.length) {
      setIndex(nextIndex)
      void speak(queue, nextIndex, teachingStyle)
    }
  }, [index, queue, speak, teachingStyle])

  const previous = useCallback(() => {
    const prevIndex = index - 1
    if (prevIndex >= 0) {
      setIndex(prevIndex)
      void speak(queue, prevIndex, teachingStyle)
    }
  }, [index, queue, speak, teachingStyle])

  const repeat = useCallback(() => {
    void speak(queue, index, teachingStyle)
  }, [index, queue, speak, teachingStyle])

  return (
    <ListenCtx.Provider
      value={{
        isOpen,
        isLoading,
        isPlaying,
        error,
        currentLabel: queue[index]?.label ?? null,
        queue,
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

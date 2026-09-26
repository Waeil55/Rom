import { SpeakerWaveIcon } from '@heroicons/react/24/outline'
import { useListen } from './ListenContext'

interface ListenButtonProps {
  label: string
  text: string
  className?: string
  size?: 'sm' | 'md'
}

export function ListenButton({ label, text, className = '', size = 'sm' }: ListenButtonProps) {
  const { play } = useListen()
  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm'

  return (
    <button
      onClick={() => play([{ label, text }])}
      className={`inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 ${padding} ${className}`}
    >
      <SpeakerWaveIcon className="h-4 w-4" />
      Listen
    </button>
  )
}

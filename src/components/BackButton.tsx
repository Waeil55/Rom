import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
}

export function BackButton({ to, label = 'Back', className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  function handleClick() {
    if (to) navigate(to)
    else if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 ${className}`}
    >
      <ChevronLeftIcon className="h-4 w-4" />
      {label}
    </button>
  )
}

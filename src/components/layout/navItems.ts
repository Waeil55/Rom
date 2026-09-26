import type { ComponentType } from 'react'
import {
  HomeIcon,
  PlayCircleIcon,
  BeakerIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/learn', label: 'Learn', icon: PlayCircleIcon },
  { to: '/medicines', label: 'Medicines', icon: BeakerIcon },
  { to: '/study', label: 'Study', icon: AcademicCapIcon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
]

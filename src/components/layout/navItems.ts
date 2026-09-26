import type { ComponentType } from 'react'
import {
  HomeIcon,
  PlayCircleIcon,
  BeakerIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  AcademicCapIcon as NaplexIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

export interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

/** Core 5 — shown in the mobile bottom nav and at the top of the desktop sidebar. */
export const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/learn', label: 'Learn', icon: PlayCircleIcon },
  { to: '/medicines', label: 'Medicines', icon: BeakerIcon },
  { to: '/study', label: 'Study', icon: AcademicCapIcon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
]

/** Extra sections — full desktop sidebar only; still reachable on mobile via cards on Home/Study/Learn. */
export const moreNavItems: NavItem[] = [
  { to: '/naplex', label: 'NAPLEX 2026', icon: NaplexIcon },
  { to: '/listen-hub', label: 'Listen Hub', icon: SpeakerWaveIcon },
  { to: '/counseling', label: 'Counseling Points', icon: ChatBubbleLeftRightIcon },
]

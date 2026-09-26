import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { ListenProvider } from './components/ListenContext'
import { useAppStore } from './store/useAppStore'
import { Home } from './pages/Home'
import { Learn } from './pages/Learn'
import { Medicines } from './pages/Medicines'
import { MedicineDetail } from './pages/MedicineDetail'
import { Study } from './pages/Study'
import { Flashcards } from './pages/study/Flashcards'
import { Quiz } from './pages/study/Quiz'
import { Matching } from './pages/study/Matching'
import { WeakAreas } from './pages/study/WeakAreas'
import { Settings } from './pages/Settings'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { ResetPassword } from './pages/auth/ResetPassword'
import { NotFound } from './pages/NotFound'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AddMedicine } from './pages/admin/AddMedicine'
import { Naplex } from './pages/Naplex'
import { ListenHub } from './pages/ListenHub'
import { Counseling } from './pages/Counseling'

function useThemeEffect() {
  const { theme, textSize, reducedMotion } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function apply() {
      const isDark = theme === 'dark' || (theme === 'system' && media.matches)
      root.classList.toggle('dark', isDark)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', textSize)
  }, [textSize])

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion)
  }, [reducedMotion])
}

export default function App() {
  useThemeEffect()

  return (
    <ListenProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/medicines/:id" element={<MedicineDetail />} />
            <Route path="/study" element={<Study />} />
            <Route path="/study/flashcards" element={<Flashcards />} />
            <Route path="/study/quiz" element={<Quiz />} />
            <Route path="/study/matching" element={<Matching />} />
            <Route path="/study/weak-areas" element={<WeakAreas />} />
            <Route path="/naplex" element={<Naplex />} />
            <Route path="/listen-hub" element={<ListenHub />} />
            <Route path="/counseling" element={<Counseling />} />
            <Route path="/settings" element={<Settings />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/add-medicine" element={<AddMedicine />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </ListenProvider>
  )
}

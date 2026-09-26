import { useEffect, Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { ListenProvider } from './components/ListenContext'
import { useAppStore } from './store/useAppStore'
import { Home } from './pages/Home'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { ResetPassword } from './pages/auth/ResetPassword'

const Learn = lazy(() => import('./pages/Learn').then((m) => ({ default: m.Learn })))
const Medicines = lazy(() => import('./pages/Medicines').then((m) => ({ default: m.Medicines })))
const MedicineDetail = lazy(() => import('./pages/MedicineDetail').then((m) => ({ default: m.MedicineDetail })))
const Study = lazy(() => import('./pages/Study').then((m) => ({ default: m.Study })))
const Flashcards = lazy(() => import('./pages/study/Flashcards').then((m) => ({ default: m.Flashcards })))
const Quiz = lazy(() => import('./pages/study/Quiz').then((m) => ({ default: m.Quiz })))
const Matching = lazy(() => import('./pages/study/Matching').then((m) => ({ default: m.Matching })))
const WeakAreas = lazy(() => import('./pages/study/WeakAreas').then((m) => ({ default: m.WeakAreas })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const AddMedicine = lazy(() => import('./pages/admin/AddMedicine').then((m) => ({ default: m.AddMedicine })))
const Naplex = lazy(() => import('./pages/Naplex').then((m) => ({ default: m.Naplex })))
const ListenHub = lazy(() => import('./pages/ListenHub').then((m) => ({ default: m.ListenHub })))
const Counseling = lazy(() => import('./pages/Counseling').then((m) => ({ default: m.Counseling })))
const Diseases = lazy(() => import('./pages/Diseases').then((m) => ({ default: m.Diseases })))
const DiseaseDetail = lazy(() => import('./pages/DiseaseDetail').then((m) => ({ default: m.DiseaseDetail })))
const DiseaseFlashcards = lazy(() =>
  import('./pages/study/DiseaseFlashcards').then((m) => ({ default: m.DiseaseFlashcards }))
)
const DiseaseQuiz = lazy(() => import('./pages/study/DiseaseQuiz').then((m) => ({ default: m.DiseaseQuiz })))

function RouteFallback() {
  return <div className="flex h-full items-center justify-center py-24 text-slate-400">Loading…</div>
}

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
      <Suspense fallback={<RouteFallback />}>
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
              <Route path="/diseases" element={<Diseases />} />
              <Route path="/diseases/:id" element={<DiseaseDetail />} />
              <Route path="/study/diseases/flashcards" element={<DiseaseFlashcards />} />
              <Route path="/study/diseases/quiz" element={<DiseaseQuiz />} />
              <Route path="/settings" element={<Settings />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/add-medicine" element={<AddMedicine />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ListenProvider>
  )
}

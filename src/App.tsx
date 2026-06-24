import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useWedding } from './context/WeddingContext'
import Loading from './components/Loading'
import LoginScreen from './screens/LoginScreen'
import WaitingActivationScreen from './screens/WaitingActivationScreen'
import AccessExpiredScreen from './screens/AccessExpiredScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import AppShell from './components/AppShell'
import DashboardPage from './pages/DashboardPage'
import BudgetPage from './pages/BudgetPage'
import EventsPage from './pages/EventsPage'
import GuestsPage from './pages/GuestsPage'
import MorePage from './pages/MorePage'
import ChecklistPage from './pages/ChecklistPage'
import RundownPage from './pages/RundownPage'
import DocumentsPage from './pages/DocumentsPage'
import SeserahanPage from './pages/SeserahanPage'
import HoneymoonPage from './pages/HoneymoonPage'
import RemindersPage from './pages/RemindersPage'
import ProfilPage from './pages/ProfilPage'

export default function App() {
  const { accessState } = useAuth()
  const { wedding, loading: weddingLoading } = useWedding()

  // Gate berlapis (di level app, sesuai desain skema):
  switch (accessState) {
    case 'loading':
      return <Loading />
    case 'unauthenticated':
      return <LoginScreen />
    case 'pending':
      return <WaitingActivationScreen />
    case 'expired':
      return <AccessExpiredScreen />
    case 'active': {
      // Modul 1: user aktif tapi belum punya data wedding -> onboarding.
      if (weddingLoading) return <Loading label="Menyiapkan…" />
      if (!wedding) return <OnboardingScreen />
      return (
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="acara" element={<EventsPage />} />
            <Route path="tamu" element={<GuestsPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="rundown" element={<RundownPage />} />
            <Route path="dokumen" element={<DocumentsPage />} />
            <Route path="seserahan" element={<SeserahanPage />} />
            <Route path="honeymoon" element={<HoneymoonPage />} />
            <Route path="reminder" element={<RemindersPage />} />
            <Route path="profil" element={<ProfilPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )
    }
  }
}

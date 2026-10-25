import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { LoadingState } from './components/LoadingState'
import { LanguageSelectorModal } from './components/LanguageSelectorModal'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { PhysicalSafetyPage } from './pages/PhysicalSafetyPage'
import { TrustedContactsPage } from './pages/TrustedContactsPage'
import { JourneySafetyPage } from './pages/JourneySafetyPage'
import { DigitalProtectionPage } from './pages/DigitalProtectionPage'
import { AssistantPage } from './pages/AssistantPage'
import { EvidencePage } from './pages/EvidencePage'
import { HelpDirectoryPage } from './pages/HelpDirectoryPage'
import { SettingsPage } from './pages/SettingsPage'
import { MobileBottomNav } from './components/MobileBottomNav'

const ProtectedLayout = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingState message="Verifying security credentials..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="authenticated-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  )
}

export function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <LanguageSelectorModal />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/physical-safety" element={<PhysicalSafetyPage />} />
          <Route path="/trusted-contacts" element={<TrustedContactsPage />} />
          <Route path="/journey-safety" element={<JourneySafetyPage />} />
          <Route path="/digital-protection" element={<DigitalProtectionPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/help-directory" element={<HelpDirectoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

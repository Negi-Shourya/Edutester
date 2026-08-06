import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import ScrollToTop from './components/ScrollToTop'
import RootGate from './components/RootGate'
import LandingPage from './pages/LandingPage'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import ChapterTests from './pages/ChapterTests'
import PaperTests from './pages/PaperTests'
import TestInterface from './pages/TestInterface'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { trackPageView } from './lib/tracking'

function App() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <AuthProvider>
      <MotionConfig reducedMotion="user">
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <PageTransition>
          <Routes location={location}>
            <Route path="/" element={<RootGate />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chapter-tests"
              element={
                <ProtectedRoute>
                  <ChapterTests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paper-tests"
              element={
                <ProtectedRoute>
                  <PaperTests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <TestInterface />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
          </PageTransition>
        </main>
        <Footer />
      </div>
      </MotionConfig>
    </AuthProvider>
  )
}

export default App

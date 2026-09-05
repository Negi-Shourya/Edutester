import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';
import RootGate from './components/RootGate';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { trackPageView } from './lib/tracking';
import LandingPage from './pages/LandingPage';

// Route-level code splitting to keep initial bundle size small. LandingPage
// is imported statically: "/" renders it on first paint (via RootGate), so
// splitting it would only add a network round-trip before LCP.
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChapterTests = lazy(() => import('./pages/ChapterTests'));
const PaperTests = lazy(() => import('./pages/PaperTests'));
const TestInterface = lazy(() => import('./pages/TestInterface'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/Profile'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Faq = lazy(() => import('./pages/Faq'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const location = useLocation();

  useEffect(() => {
    // Page-view tracking hits Supabase over the network — defer it until
    // the browser is idle so it never contends with first paint / LCP.
    const path = location.pathname;
    const fire = () => trackPageView(path);
    // SPA route change: tell Google Analytics (gtag.js is in index.html).
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
      gtag?: (...args: unknown[]) => void;
    };
    if (typeof w.gtag === 'function') {
      w.gtag('config', 'G-EYPDRP3HFR', { page_path: path });
    }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(fire, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = w.setTimeout(fire, 2500);
    return () => w.clearTimeout(t);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">
            <PageTransition>
              <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                  <Route path="/" element={<RootGate />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/faq" element={<Faq />} />
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
              </Suspense>
            </PageTransition>
          </main>
          <Footer />
        </div>
    </AuthProvider>
  );
}

export default App;

import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const LandingPage = lazy(() => import('../pages/LandingPage'));

// Root "/" gate: routes returning users to the dashboard and
// new/logged-out visitors to the public landing page.
export default function RootGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={null}>
      <LandingPage />
    </Suspense>
  );
}

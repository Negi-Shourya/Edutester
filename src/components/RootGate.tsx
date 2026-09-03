import { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import LandingPage from '../pages/LandingPage';

// Root "/" gate: routes returning users to the dashboard and
// new/logged-out visitors to the public landing page.
//
// LandingPage is imported statically (not lazy): "/" is the most common
// first paint and the PageSpeed-tested URL, so the hero must render without
// an extra chunk round-trip. Other routes in App.tsx stay lazy.
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

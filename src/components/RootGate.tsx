import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import LandingPage from '../pages/LandingPage';

// Root "/" gate: waits for the persisted session check to resolve before
// rendering anything, then routes returning users to the dashboard and
// new/logged-out visitors to the public landing page.
export default function RootGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}

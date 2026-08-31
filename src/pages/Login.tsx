import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Loader2, Lock, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import GoogleIcon from '../components/GoogleIcon';
import { getExam, setExam, type ExamType } from '../lib/exam';
import { setAuthFlow } from '../lib/consent';

const perks = [
  { icon: Zap, text: 'Instant sign in — no password to remember' },
  { icon: Lock, text: 'Secure & private with your Google account' },
  { icon: ShieldCheck, text: 'One-tap access on every device' },
];

export default function Login() {
  const location = useLocation();
  const { user, loading, signInWithGoogle, authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [track, setTrack] = useState<ExamType>(getExam());

  if (!loading && user) {
    const from = (location.state as { from?: string } | null)?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    setAuthFlow('login');
    try {
      const from = (location.state as { from?: string } | null)?.from;
      await signInWithGoogle(from ? `${window.location.origin}${from}` : undefined);
    } catch {
      setGoogleLoading(false);
      setError('Could not start Google sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-paper via-white to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-amber-100/50 rounded-full blur-2xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-primary/5 border border-white/60 p-8 sm:p-10">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="EduTester" className="w-16 h-16 object-contain mx-auto mb-5" />
            <h1 className="text-2xl font-bold text-gray-900 font-display">Welcome back</h1>
            <p className="text-gray-500 mt-1.5">Sign in to continue your exam preparation</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {authError && !error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              Sign in failed: {authError}
            </div>
          )}

          {/* Exam track */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2.5">I'm preparing for</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setTrack('jee'); setExam('jee'); }}
                className={`rounded-2xl border-2 px-4 py-3.5 text-left transition-all ${
                  track === 'jee'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="block text-sm font-bold text-gray-900">JEE Main</span>
                <span className="block text-xs text-gray-500 mt-0.5">B.E./B.Tech entrance</span>
              </button>
              <button
                type="button"
                onClick={() => { setTrack('neet'); setExam('neet'); }}
                className={`rounded-2xl border-2 px-4 py-3.5 text-left transition-all ${
                  track === 'neet'
                    ? 'border-green-600 bg-green-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="block text-sm font-bold text-gray-900">NEET (UG)</span>
                <span className="block text-xs text-gray-500 mt-0.5">Medical entrance</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-3.5 text-sm font-bold text-gray-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Opening Google...' : 'Continue with Google'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            One tap. No passwords to remember.
          </p>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              Your benefits
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk.text} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <perk.icon className="w-4 h-4" />
                </span>
                {perk.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

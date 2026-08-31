import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  Loader2,
  Lock,
  Zap,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import GoogleIcon from '../components/GoogleIcon';
import { setExam, type ExamType } from '../lib/exam';
import { savePendingConsent } from '../lib/consent';

const perks = [
  { icon: Zap, text: 'Instant sign up with your existing Google account' },
  { icon: Lock, text: 'No passwords to remember or reset' },
  { icon: ShieldCheck, text: 'Your details stay private, encrypted and secure' },
];

export default function Signup() {
  const location = useLocation();
  const { user, loading, signInWithGoogle, authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [track, setTrack] = useState<ExamType>('jee');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const isUnregisteredRedirect = searchParams.get('notice') === 'unregistered';

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogle = async () => {
    if (!acceptedTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setError(null);
    setGoogleLoading(true);

    // Save verifiable consent and entry timestamp prior to OAuth redirect
    savePendingConsent(track);

    try {
      await signInWithGoogle();
    } catch {
      setGoogleLoading(false);
      setError('Could not start Google sign up. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-paper via-white to-primary/5 flex items-center justify-center px-4 py-12">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-amber-100/50 rounded-full blur-2xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-xl shadow-primary/5 border border-white/60 p-8 sm:p-10">
          <div className="text-center mb-7">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="EduTester Logo"
                width="64"
                height="64"
                fetchPriority="high"
                decoding="async"
                className="w-16 h-16 object-contain mx-auto mb-4"
              />
            </picture>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Create your account</h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              Start practicing on EduTester in seconds
            </p>
          </div>

          {isUnregisteredRedirect && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-800 flex items-start gap-2.5 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-900">Welcome to EduTester!</strong>
                <span>No existing account was found for that Google ID. Please choose your exam track and create your account below.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {authError && !error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              Sign up failed: {authError}
            </div>
          )}

          {/* Exam track */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2.5">I'm preparing for</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setTrack('jee'); setExam('jee'); }}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${
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
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${
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

          {/* Clean, user-friendly consent checkbox */}
          <div className="mb-5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked) setTermsError(false);
                }}
                className="mt-0.5 w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-primary font-semibold hover:underline">
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="text-primary font-semibold hover:underline">
                  Privacy Policy
                </Link>
                , and confirm I am 18+ or have parent/guardian consent.
              </span>
            </label>

            {termsError && (
              <p className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Please accept the Terms and Privacy Policy to continue.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            aria-disabled={!acceptedTerms}
            className={`w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-3.5 text-sm font-bold text-gray-800 transition-all duration-200 ${
              acceptedTerms
                ? 'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 cursor-pointer'
                : 'opacity-60 cursor-not-allowed'
            }`}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Opening Google...' : 'Sign up with Google'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Secure sign up. No passwords to remember.
          </p>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              Why Google
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
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

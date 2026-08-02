import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Loader2, Lock, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleIcon from '../components/GoogleIcon';

const perks = [
  { icon: Zap, text: 'Instant sign up with your existing Google account' },
  { icon: Lock, text: 'No passwords to remember or reset' },
  { icon: ShieldCheck, text: 'Your details stay private and secure' },
];

export default function Signup() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setGoogleLoading(false);
      setError('Could not start Google sign up. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-amber-100/50 rounded-full blur-2xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl shadow-primary/5 border border-white/60 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1.5">
              Start practicing on Edutester in seconds
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-2xl py-3.5 text-sm font-bold text-gray-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Opening Google...' : 'Sign up with Google'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            No sign-up forms. No passwords. Just one click.
          </p>

          <div className="flex items-center gap-3 my-7">
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

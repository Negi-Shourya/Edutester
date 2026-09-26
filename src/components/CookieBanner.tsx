import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'edutester_cookie_consent_accepted';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!accepted) {
        // Show after a gentle 1.5s delay so it doesn't distract from first paint
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage restricted
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-2xl rounded-2xl p-4 sm:p-5 text-gray-800 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <span className="font-semibold text-gray-900 block mb-1">We value your privacy</span>
          We use essential cookies for secure login and partner referral attribution. Learn more in our{' '}
          <Link to="/cookies" className="text-primary hover:underline font-medium inline-block">
            Cookie Policy
          </Link>.
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-lg"
          aria-label="Close cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-3.5 flex items-center justify-end gap-2.5">
        <Link
          to="/cookies"
          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Manage / Learn More
        </Link>
        <button
          onClick={handleAccept}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm transition-all"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

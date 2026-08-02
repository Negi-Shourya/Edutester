import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export default function PaywallModal({ open, onClose, title }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
          <Lock className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title ?? 'This test is locked'}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          An active subscription is required to attempt this test. Subscribe to
          unlock every test and full paper.
        </p>

        <button
          onClick={() => {
            onClose();
            navigate('/pricing');
          }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          <Crown className="w-4 h-4" />
          View Subscription Plans
        </button>
        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, X, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useSubscriptionAccess } from '../lib/subscription';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { hasAccess, loading: subscriptionLoading } = useSubscriptionAccess();

  if (location.pathname.startsWith('/test')) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      // Always land on the public About Us page — even if ProtectedRoute
      // races to redirect to /login mid-signout.
      navigate('/landing', { replace: true });
    }
  };

  const homeTo = user ? '/dashboard' : '/';
  // Guests only see the public site (about us, pricing, contact). The
  // dashboard and test links are for signed-in users — guards bounce guests
  // to /login if they try to open those pages directly.
  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/chapter-tests', label: 'Chapter Tests' },
        { to: '/paper-tests', label: 'Paper Tests' },
        // Paying users don't need to see the pricing page.
        ...(subscriptionLoading || !hasAccess ? [{ to: '/pricing', label: 'Pricing' }] : []),
        { to: '/contact', label: 'Contact Us' },
      ]
    : [
        { to: '/landing', label: 'About Us' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/contact', label: 'Contact Us' },
      ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to={homeTo} className="flex items-center gap-2">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt="EduTester Logo"
                width="32"
                height="32"
                fetchPriority="high"
                decoding="async"
                className="w-8 h-8 object-contain"
              />
            </picture>
            <picture>
              <source srcSet="/EduTester_Text.webp" type="image/webp" />
              <img
                src="/EduTester_Text.png"
                alt="EduTester"
                width="120"
                height="24"
                fetchPriority="high"
                decoding="async"
                className="h-6 w-auto object-contain"
              />
            </picture>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors group ${
                  location.pathname === link.to
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {link.label}
                {location.pathname === link.to ? (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-saffron"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : (
                  <span className="absolute -bottom-1 left-0 h-0.5 rounded-full bg-saffron/50 w-0 group-hover:w-full transition-all duration-300" />
                )}
              </Link>
            ))}
            <div className="flex items-center gap-3 ml-4">
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-2">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile avatar"
                        width="28"
                        height="28"
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {(user.email ?? '?')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[140px] truncate">
                      {user.user_metadata?.full_name ?? user.email}
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-1.5 text-sm font-medium bg-saffron text-white px-4 py-2 rounded-lg hover:bg-saffron-dark transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.to
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1 text-center px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

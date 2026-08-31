import { Link, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useSubscriptionAccess } from '../lib/subscription';

export default function Footer() {
  const location = useLocation();
  const { user } = useAuth();
  const { hasAccess, loading: subscriptionLoading } = useSubscriptionAccess();

  if (location.pathname.startsWith('/test')) {
    return null;
  }

  const showPricing = subscriptionLoading || !hasAccess;
  return (
    <footer className="bg-primary-dark text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="EduTester Logo"
                  width="32"
                  height="32"
                  loading="lazy"
                  decoding="async"
                  className="w-8 h-8 object-contain"
                />
              </picture>
              <picture>
                <source srcSet="/EduTester_Text_white.webp" type="image/webp" />
                <img
                  src="/EduTester_Text_white.png"
                  alt="EduTester"
                  width="100"
                  height="20"
                  loading="lazy"
                  decoding="async"
                  className="h-5 w-auto object-contain"
                />
              </picture>
            </div>
            <p className="text-sm text-gray-400">
              India's most affordable test preparation platform. Practice chapter-wise and paper-wise tests with NTA-like interface.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              {showPricing && <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>}
              {user && (
                <>
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link to="/chapter-tests" className="hover:text-white transition-colors">Chapter Tests</Link></li>
                  <li><Link to="/paper-tests" className="hover:text-white transition-colors">Paper Tests</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2025/10/202510311323551056.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  JEE Main Syllabus
                </a>
              </li>
              <li>
                <a
                  href="https://nta.ac.in/Download/Notice/Notice_20260108180635.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  NEET (UG) Syllabus
                </a>
              </li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              {showPricing && <li><Link to="/pricing#faq" className="hover:text-white transition-colors">FAQ</Link></li>}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 font-display">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-saffron" />
                <a href="mailto:help@edutester.in" className="hover:text-white transition-colors">
                  help@edutester.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} EduTester. All rights reserved. | Made with &hearts; for exam aspirants
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <span>&middot;</span>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <span>&middot;</span>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

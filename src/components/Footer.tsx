import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith('/test')) {
    return null;
  }
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-6 h-6 text-primary-light" />
              <span className="text-lg font-bold text-white">EduTester</span>
            </div>
            <p className="text-sm text-gray-400">
              India's most affordable test preparation platform. Practice chapter-wise and paper-wise tests with NTA-like interface.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/chapter-tests" className="hover:text-white transition-colors">Chapter Tests</Link></li>
              <li><Link to="/paper-tests" className="hover:text-white transition-colors">Paper Tests</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">JEE Main Syllabus</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preparation Tips</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-light" />
                support@edutester.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-light" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-light" />
                Bengaluru, India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} EduTester. All rights reserved. | Made with &hearts; for exam aspirants
        </div>
      </div>
    </footer>
  );
}

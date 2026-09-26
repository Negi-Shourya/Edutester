import { Link } from 'react-router-dom';
import {
  Cookie,
  ShieldCheck,
  ArrowLeft,
  Mail,
  CheckCircle2,
  Clock,
  Share2,
  Sliders,
  FileText,
} from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
                Cookie &amp; Storage Policy
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Last updated: September 26, 2026 &middot; Compliant with DPDPA 2023 &amp; standard web transparency guidelines
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Card */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-saffron/5 border border-primary/20">
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4" /> Our Privacy-First Storage Commitment
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            EduTester uses cookies and secure browser storage (localStorage) exclusively to provide seamless authentication, protect your test sessions, measure anonymous platform performance, and accurately credit educational creators and YouTubers who recommend our platform. We <strong>never sell your data</strong> or use intrusive third-party cross-site advertising trackers.
          </p>
        </div>

        <div className="prose prose-sm sm:prose max-w-none text-gray-600 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" /> 1. What Are Cookies and Local Storage?
            </h2>
            <p className="mt-3 leading-relaxed">
              Cookies are small text files stored on your computer or mobile device when you visit a website. In addition to HTTP cookies, modern web platforms also use browser <strong>Local Storage</strong> and <strong>Session Storage</strong> to maintain secure application state across page reloads without transferring unnecessary data across every network request.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" /> 2. Types of Cookies &amp; Storage We Use
            </h2>
            <div className="mt-4 space-y-4">
              {/* Category A */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  A. Strictly Necessary &amp; Security (Essential)
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">
                  These storage keys are required for the platform to function securely. Without them, you cannot log in, take tests, or access your paid subscription.
                </p>
                <div className="text-xs text-gray-500 bg-white p-2.5 rounded-lg border border-gray-200 font-mono space-y-1">
                  <div><strong>sb-*-auth-token:</strong> Supabase authentication session JWT &amp; refresh token.</div>
                  <div><strong>edutester_remember:</strong> Remembers your sign-in preference.</div>
                  <div><strong>Duration:</strong> Session or persistent until you click Log Out.</div>
                </div>
              </div>

              {/* Category B */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-1">
                  <Share2 className="w-4 h-4 text-primary" />
                  B. Partner &amp; Creator Referral Attribution (Functional)
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">
                  When you visit EduTester through a link shared by an educational YouTuber or teacher (e.g., <code className="bg-gray-100 px-1 py-0.5 rounded text-primary">?ref=channel_name</code>), we temporarily save an identifier so we can credit them if you decide to sign up or purchase a subscription.
                </p>
                <div className="text-xs text-gray-500 bg-white p-2.5 rounded-lg border border-gray-200 font-mono space-y-1">
                  <div><strong>edutester_referral_code / edutester_ref:</strong> Stores the partner referral code.</div>
                  <div><strong>edutester_referral_time:</strong> Timestamp of initial link visit.</div>
                  <div><strong>Duration:</strong> 30-day attribution window (cleared automatically upon registration).</div>
                </div>
              </div>

              {/* Category C */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  C. Performance &amp; Analytics
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">
                  We collect aggregated, non-personally identifiable telemetry to understand platform traffic, page latency, and test loading performance.
                </p>
                <div className="text-xs text-gray-500 bg-white p-2.5 rounded-lg border border-gray-200 font-mono space-y-1">
                  <div><strong>_ga, _ga_*:</strong> Google Analytics tokens (anonymized visitor statistics).</div>
                  <div><strong>Duration:</strong> Up to 13 months.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" /> 3. How Can You Control or Clear Cookies?
            </h2>
            <p className="mt-3 leading-relaxed">
              You can control and manage cookies through your browser settings:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs sm:text-sm leading-relaxed">
              <li>
                <strong>Browser Settings:</strong> You can configure Chrome, Edge, Safari, or Firefox to block or alert you when cookies are set, or clear all existing cookies and local storage.
              </li>
              <li>
                <strong>Impact of Blocking Essential Cookies:</strong> Please note that if you disable essential local storage or cookies, you will not be able to log in or take tests on EduTester.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 4. Related Policies &amp; Contact
            </h2>
            <p className="mt-3 leading-relaxed">
              For comprehensive details on how we safeguard personal data in compliance with the Digital Personal Data Protection Act (DPDPA 2023), please review our{' '}
              <Link to="/privacy" className="text-primary hover:underline font-semibold">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/terms" className="text-primary hover:underline font-semibold">
                Terms of Service
              </Link>.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-1">
                <Mail className="w-4 h-4 text-primary" /> Questions about our cookie practices?
              </div>
              <p className="text-gray-600">
                Contact our data and privacy grievance team at{' '}
                <a href="mailto:help@edutester.in" className="text-primary hover:underline font-medium">
                  help@edutester.in
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

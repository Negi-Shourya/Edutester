import { Link } from 'react-router-dom';
import { ShieldCheck, Scale, ArrowLeft, Mail, AlertTriangle } from 'lucide-react';

export default function Terms() {
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
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Terms and Conditions</h1>
              <p className="text-xs text-gray-500 mt-0.5">Last updated: August 31, 2026 &middot; Compliant with Indian Law &amp; DPDPA 2023</p>
            </div>
          </div>
        </div>

        <div className="prose prose-sm sm:prose max-w-none text-gray-600 space-y-8">
          {/* Summary Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/15 text-gray-800 text-sm">
            <h3 className="text-base font-semibold text-primary-dark mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Key Highlights for Students
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-gray-700 list-disc pl-5">
              <li>EduTester provides NTA-pattern mock tests and practice analytics for JEE Main &amp; NEET (UG).</li>
              <li>You own your personal data. We only use your information to provide test simulation, grading, and performance tracking.</li>
              <li>We never sell, rent, or trade your personal data with third-party advertisers.</li>
              <li>Subscriptions grant digital access to chapter tests and full mock tests for the duration purchased.</li>
            </ul>
          </div>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">1. Acceptance of Terms</h2>
            <p className="mt-3 leading-relaxed">
              By accessing, browsing, registering on, or using <strong>EduTester</strong> (the &ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), you (&ldquo;User&rdquo;, &ldquo;Student&rdquo;, or &ldquo;Data Principal&rdquo;) agree to be legally bound by these Terms and Conditions (&ldquo;Terms&rdquo;) and our Privacy Policy in compliance with the laws of India, including the <em>Information Technology Act, 2000</em> and the <em>Digital Personal Data Protection Act (DPDPA), 2023</em>.
            </p>
            <p className="mt-2 leading-relaxed">
              If you do not agree with any portion of these Terms, you must not access or use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">2. Eligibility &amp; Age of Consent</h2>
            <p className="mt-3 leading-relaxed">
              Our services are designed for students preparing for competitive entrance examinations such as JEE (Main) and NEET (UG).
            </p>
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Under-18 / Minor Representation:</strong> In accordance with Section 9 of the Digital Personal Data Protection Act 2023, if you are under 18 years of age, you represent that you have reviewed these Terms with your parent or lawful guardian and that they have consented to your registration, use of the Platform, and any subscription purchases.
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">3. User Account, Sign-in &amp; Entry Logs</h2>
            <p className="mt-3 leading-relaxed">
              EduTester employs secure Google OAuth single sign-on. When you create an account:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>You agree to provide accurate and authentic account information through your Google profile.</li>
              <li>You are responsible for maintaining the security of your Google credentials.</li>
              <li>
                <strong>Audit &amp; Entry Logging:</strong> To ensure platform integrity, prevent unauthorized account sharing, and comply with verifiable consent obligations under DPDPA 2023, EduTester automatically logs user entry times, login timestamps, session starts, IP address metadata, and consent verification timestamps.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">4. Platform Services &amp; Examination Simulations</h2>
            <p className="mt-3 leading-relaxed">
              EduTester offers chapter-wise practice tests, previous year papers, and full-length simulated mock tests modeled after the National Testing Agency (NTA) computer-based test (CBT) interface.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Questions and test formats are curated for educational practice only. EduTester is an independent preparation platform and is not officially affiliated with or endorsed by the NTA, NBE, or Government of India.</li>
              <li>Answer keys and solutions provided are prepared with pedagogical care; however, in cases of dispute, the official question paper release from the respective examination authority remains the reference standard.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">5. Subscriptions, Payments &amp; Cancellations</h2>
            <p className="mt-3 leading-relaxed">
              EduTester offers subscription plans (e.g. 1 Month, 3 Months, 6 Months, 1 Year) granting access to premium test papers and advanced analytics.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>All payments are securely processed in Indian Rupees (INR) via Razorpay, an RBI-authorized payment aggregator.</li>
              <li>Subscription periods start immediately upon successful transaction verification and expire at the end of the selected plan validity.</li>
              <li>Because digital question banks and test access are provisioned instantly upon payment, subscription purchases are generally non-refundable once activated, unless otherwise required by applicable Indian consumer regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">6. Prohibited Conduct</h2>
            <p className="mt-3 leading-relaxed">Users agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Scrape, duplicate, decompile, reverse-engineer, or bulk-export questions, diagrams, solutions, or proprietary test code from the platform.</li>
              <li>Engage in automated scraping, bot submissions, or distributed attacks against our APIs.</li>
              <li>Share subscription access or credentials across multiple unauthorized individuals for commercial exploitation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">7. Grievance Redressal &amp; Contact Information</h2>
            <p className="mt-3 leading-relaxed">
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and Section 13 of the Digital Personal Data Protection Act, 2023, our Grievance Officer details are as follows:
            </p>
            <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm space-y-1.5">
              <p><strong>Grievance Officer:</strong> Compliance &amp; Grievance Redressal Team</p>
              <p><strong>Platform:</strong> EduTester (edutester.in)</p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-primary" />
                <strong>Email:</strong> <a href="mailto:help@edutester.in" className="text-primary hover:underline font-semibold">help@edutester.in</a>
              </p>
              <p><strong>Response Timeline:</strong> Acknowledgement within 48 hours; resolution within 30 days.</p>
              <p><strong>Escalation:</strong> If any grievance remains unresolved, users have the right to file a complaint before the Data Protection Board of India.</p>
            </div>
          </section>

          <section className="pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>
              These Terms constitute the entire agreement between you and EduTester regarding your use of the platform. By continuing to use EduTester, you acknowledge that you have read, understood, and consented to these Terms and our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

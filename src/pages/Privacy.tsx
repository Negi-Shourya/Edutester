import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck,
  ArrowLeft,
  Mail,
  UserCheck,
  Clock,
  Building2,
  AlertCircle
} from 'lucide-react';

export default function Privacy() {
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
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">
                Privacy &amp; Data Protection Notice
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Digital Personal Data Protection Act (DPDPA 2023) Compliance Notice &middot; Last updated: August 31, 2026
              </p>
            </div>
          </div>
        </div>

        {/* Section 5 Statutory Notice Card */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-saffron/5 border border-primary/20">
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
            <FileCheck className="w-4 h-4" /> Statutory Notice under Section 5 of DPDPA, 2023
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            This notice informs you, as a <strong>Data Principal</strong> under the Indian Digital Personal Data Protection Act, 2023, regarding the categories of personal data collected by <strong>EduTester</strong> (&ldquo;Data Fiduciary&rdquo;), the specific purpose of processing, your statutory rights, and how you may contact our Grievance Redressal Officer or the Data Protection Board of India.
          </p>
        </div>

        <div className="prose prose-sm sm:prose max-w-none text-gray-600 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> 1. Categories of Personal Data We Collect
            </h2>
            <p className="mt-3 leading-relaxed">
              We practice data minimization and collect only the personal data essential to deliver authentic competitive exam practice:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Identity &amp; Profile Data</h4>
                <p className="text-gray-600">Full name, email address, and avatar URL provided securely through Google OAuth authentication.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Exam Track &amp; Academic Data</h4>
                <p className="text-gray-600">Target examination stream (JEE Main or NEET UG), target year, and chapter test selections.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Test Performance &amp; Analytics</h4>
                <p className="text-gray-600">Question answers, time spent per question, accuracy, test scores, and chapter mastery percentiles.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Entry Times &amp; Audit Metadata</h4>
                <p className="text-gray-600">Person entry timestamps, login events, session access times, browser user-agent, and verifiable consent logs.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> 2. Specified Lawful Purpose for Processing
            </h2>
            <p className="mt-3 leading-relaxed">
              Your personal data is processed strictly for the following lawful and explicit purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Authentication &amp; User Access:</strong> Securely identifying your student profile and maintaining your ongoing test sessions.</li>
              <li><strong>Exam Simulation &amp; Scoring:</strong> Administering chapter tests and full mock tests under simulated NTA guidelines and computing accurate test scores.</li>
              <li><strong>Student Progress Dashboard:</strong> Showing your score history, time management metrics, weak areas, and question explanations.</li>
              <li><strong>Subscription Provisioning:</strong> Enabling paid test series access through Razorpay integration and managing active validity dates.</li>
              <li><strong>Security &amp; Audit Trail:</strong> Logging user entry timestamps and verifiable consent records in compliance with Indian regulatory requirements.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> 3. Entry Time Logging &amp; Verifiable Consent Records
            </h2>
            <p className="mt-3 leading-relaxed">
              In strict accordance with the rules under the Digital Personal Data Protection Act (DPDPA 2023):
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>
                <strong>Verifiable Consent:</strong> When you check the consent box during registration, EduTester records the exact date and timestamp of consent, the consent policy version, your user identifier, and browser metadata.
              </li>
              <li>
                <strong>Entry Time Tracking:</strong> When students log in or start an examination session, an entry timestamp is recorded. This ensures platform integrity, enables performance benchmarking against testing time limits, and maintains a transparent compliance audit trail.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> 4. Your Rights as a Data Principal (DPDPA 2023)
            </h2>
            <p className="mt-3 leading-relaxed">
              Under Sections 11, 12, 13, and 14 of the Digital Personal Data Protection Act, you are entitled to the following statutory rights:
            </p>
            <div className="space-y-3 mt-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm">Right to Access Information (Section 11)</h4>
                <p className="text-xs text-gray-600 mt-1">You may request a summary of the personal data being processed and details of any processing activities.</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm">Right to Correction and Erasure (Section 12)</h4>
                <p className="text-xs text-gray-600 mt-1">You may request correction of inaccurate data, completion of incomplete data, or erasure of your personal data when no longer required for examination prep.</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm">Right to Withdraw Consent (Section 6(4))</h4>
                <p className="text-xs text-gray-600 mt-1">You may withdraw your consent for future data processing at any time. Withdrawal does not affect the lawfulness of processing carried out prior to withdrawal.</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm">Right of Grievance Redressal (Section 13)</h4>
                <p className="text-xs text-gray-600 mt-1">You have the right to readily available grievance redressal in respect of any act or omission of the Data Fiduciary regarding your personal data.</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm">Right to Nominate (Section 14)</h4>
                <p className="text-xs text-gray-600 mt-1">You have the right to nominate an individual who shall exercise your rights in the event of death or incapacity.</p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" /> 5. Protection of Children &amp; Minor Students (Section 9)
            </h2>
            <p className="mt-3 leading-relaxed">
              EduTester serves secondary and senior secondary students aspiring for undergraduate STEM &amp; medical degrees. In alignment with Section 9 of DPDPA 2023:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-xs sm:text-sm">
              <li>Students under 18 must register with the knowledge and consent of their parent or legal guardian.</li>
              <li>EduTester does NOT undertake targeted tracking, behavioral profiling, or advertising directed at children.</li>
              <li>We do not process any personal data likely to cause detrimental effect on the well-being of a child.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> 6. Grievance Redressal Officer &amp; Regulatory Escalation
            </h2>
            <p className="mt-3 leading-relaxed">
              For exercising any of your Data Principal rights, requesting account erasure, or registering a data privacy grievance, please reach out to our designated Grievance Officer:
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs sm:text-sm">
              <p><strong>Designation:</strong> Data Protection &amp; Grievance Redressal Officer</p>
              <p><strong>Organization:</strong> EduTester Platform (edutester.in)</p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <strong>Email:</strong>{' '}
                <a href="mailto:help@edutester.in" className="text-primary font-semibold hover:underline">
                  help@edutester.in
                </a>
              </p>
              <p><strong>Acknowledgement:</strong> All grievances are formally acknowledged within 48 hours.</p>
              <p><strong>Resolution SLA:</strong> Investigated and resolved within thirty (30) calendar days.</p>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Data Protection Board of India (DPBI)</strong>
                <span>
                  If you are unsatisfied with the resolution provided by our Grievance Officer, you have the statutory right under the DPDPA 2023 to submit a complaint before the Data Protection Board of India.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

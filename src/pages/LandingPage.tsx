import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Timer, Layers, LifeBuoy, Sparkles, GraduationCap, Target, LineChart, LogIn, UserPlus } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import ExamScreenPreview from '../components/ExamScreenPreview';
import Reveal from '../components/Reveal';
import StaggerReveal, { StaggerItem, SpringTile } from '../components/StaggerReveal';
import { useSubscriptionAccess } from '../lib/subscription';
import { useAuth } from '../context/auth-context';

const features = [
  { icon: Layers, title: 'NTA-Like Interface', description: 'Attempt every NEET mock test 2026 and JEE Main mock test on the exact NTA interface — palette, marking, and navigation included.' },
  { icon: BookOpen, title: 'NEET & JEE Previous Year Papers', description: 'Full-length NEET previous year question papers and JEE Main previous year papers with solutions, simulated under timed conditions.' },
  { icon: Timer, title: 'Chapter-Wise PYQ Tests', description: 'NEET PYQ chapter-wise and JEE Main PYQ chapter-wise tests that isolate weak topics so you can fix them one chapter at a time.' },
  { icon: LifeBuoy, title: 'Support First', description: 'We address your questions and issues first — quick help whenever you need it.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { hasAccess, loading: subscriptionLoading } = useSubscriptionAccess();
  const showPricing = subscriptionLoading || !hasAccess;

  // The marketing page is for buyers — paying users have the dashboard and
  // the contact page instead.
  if (!subscriptionLoading && hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div>
      {/* Hero — opens with the thing the exam is: the actual test screen */}
      <section className="bg-gradient-to-br from-paper via-white to-primary/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-fade-up">
                <Sparkles className="w-4 h-4" />
                India's Most Affordable Test Platform
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-6 font-display animate-fade-up" style={{ animationDelay: '80ms' }}>
                NEET Test Series 2026 &{' '}
                <span className="text-primary">JEE Main Mock Tests</span>
                <span className="text-saffron">.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: '160ms' }}>
                Practice NEET PYQs chapter-wise with step-by-step solutions —
                including NEET biology PYQs — plus JEE Main previous year
                questions and full mock tests on the authentic NTA interface.
                Same palette. Same timer. Same pressure.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-up w-full sm:w-auto" style={{ animationDelay: '240ms' }}>
                <Link to="/test?paper=02-apr-morning" className="cta-shimmer inline-flex items-center justify-center gap-2 text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98]">
                  Give a Demo Test for Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {!user && (
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Link to="/login" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white text-gray-800 px-5 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-[0.98]">
                      <LogIn className="w-4 h-4 text-primary" />
                      Login
                    </Link>
                    <Link to="/signup" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-saffron text-white px-5 py-3.5 rounded-xl text-sm font-semibold hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20 active:scale-[0.98]">
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </div>
                )}
                {user && showPricing && (
                  <Link to="/pricing" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-primary hover:text-primary transition-colors active:scale-[0.98]">
                    View Pricing
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-8 mt-10 animate-fade-up" style={{ animationDelay: '320ms' }}>
                <div>
                  <div className="font-mono text-2xl font-semibold text-gray-900">₹19<span className="text-gray-400 text-sm">/mo</span></div>
                  <div className="text-xs text-gray-500 mt-0.5">plans from</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-semibold text-gray-900">3<span className="text-gray-400 text-sm"> hr</span></div>
                  <div className="text-xs text-gray-500 mt-0.5">exam timer</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-semibold text-gray-900">90<span className="text-gray-400 text-sm"> Qs</span></div>
                  <div className="text-xs text-gray-500 mt-0.5">full paper</div>
                </div>
              </div>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
              <ExamScreenPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-saffron text-sm font-semibold uppercase tracking-wider mb-3 font-mono">
              <Target className="w-4 h-4" /> Why EduTester
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight font-display">NEET PYQs & JEE Main Previous Year Questions, One Platform</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-3">Chapter-wise NEET PYQs with solutions, NEET biology PYQs and JEE Main mock tests 2026 — everything you need to crack NEET and JEE Main.</p>
          </Reveal>
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <FeatureCard icon={f.icon} title={f.title} description={f.description} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* How it Works — a real sequence, so the steps are numbered */}
      <section className="bg-paper py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-saffron text-sm font-semibold uppercase tracking-wider mb-3 font-mono">
              <LineChart className="w-4 h-4" /> Get Started
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight font-display">How It Works</h2>
            <p className="text-gray-500 mt-3">Three steps from sign-up to your first practice session.</p>
          </Reveal>
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up in seconds — no waiting, no verification maze.' },
              { step: '02', title: 'Pick a Test', desc: 'Browse chapter-wise or paper-wise tests and dive in.' },
              { step: '03', title: 'Practice & Improve', desc: 'Attempt tests on the NTA interface and track your progress.' },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <div className="text-center group">
                  <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center font-mono text-lg font-semibold mx-auto mb-4 shadow-lg shadow-primary/20">
                    <SpringTile>{item.step}</SpringTile>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 font-display">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* SEO: exam-wise keyword content */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Reveal>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-display mb-3">
                NEET Test Series 2026 with PYQs & Solutions
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our NEET online test series covers NEET previous year questions
                with step-by-step solutions — NEET PYQ chapter-wise across
                Physics, Chemistry and Biology, dedicated NEET biology PYQ
                sets, and full-length NEET mock tests 2026 on the NTA pattern.
                Every solution explains the concept, not just the answer.
              </p>
              <Link to="/pricing" className="text-primary font-semibold text-sm hover:underline">
                See NEET test series plans →
              </Link>
            </Reveal>
            <Reveal>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-display mb-3">
                JEE Main Mock Test 2026 & PYQ Practice
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The JEE Mains test series 2026 includes JEE Main PYQ
                chapter-wise practice for Physics, Chemistry and Maths, JEE
                Main previous year papers with solutions, and timed JEE Main
                online test series papers — all on the authentic NTA mock test
                interface with instant scoring.
              </p>
              <Link to="/pricing" className="text-primary font-semibold text-sm hover:underline">
                See JEE test series plans →
              </Link>
            </Reveal>
          </div>
          <Reveal className="text-center mt-10">
            <p className="text-gray-500 mb-3">New here? Read the most-asked questions about our test series.</p>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm border border-primary/30 rounded-xl px-5 py-2.5 hover:border-primary hover:bg-primary/5 transition-all"
            >
              Frequently Asked Questions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark py-16 overflow-hidden">
        {/* ambient pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-saffron/10 blur-3xl animate-pulse-dot" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-saffron text-sm font-semibold uppercase tracking-wider mb-4 font-mono">
              <GraduationCap className="w-4 h-4" /> Free Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight font-display">Try It Before You Buy It</h2>
            <p className="text-primary-light mb-8 max-w-xl mx-auto">Take the free demo test on the real NTA interface — no payment details needed.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
              <Link to="/test?paper=02-apr-morning" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-saffron text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-saffron-dark transition-colors shadow-lg shadow-black/20 hover:-translate-y-0.5 active:scale-[0.98]">
                Give a Demo Test for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              {!user && (
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link to="/login" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white/10 text-white hover:bg-white/20 px-5 py-3.5 rounded-xl text-sm font-semibold border border-white/20 transition-all active:scale-[0.98]">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link to="/signup" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white text-primary hover:bg-gray-100 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

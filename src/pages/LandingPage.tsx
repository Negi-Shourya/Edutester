import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Timer, Layers, LifeBuoy, Sparkles, GraduationCap, Target, LineChart } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import ExamScreenPreview from '../components/ExamScreenPreview';
import Reveal from '../components/Reveal';
import StaggerReveal, { StaggerItem, SpringTile } from '../components/StaggerReveal';
import { useSubscriptionAccess } from '../lib/subscription';

const features = [
  { icon: Layers, title: 'NTA-Like Interface', description: 'Experience the exact same test interface as the actual exam conducted by NTA — palette, marking, and navigation included.' },
  { icon: BookOpen, title: 'Previous Year Papers', description: 'Practice full-length previous year question papers to simulate the real exam under timed conditions.' },
  { icon: Timer, title: 'Chapter Test Series', description: 'Chapter-wise tests that isolate your weak topics so you can fix them one chapter at a time.' },
  { icon: LifeBuoy, title: 'Support First', description: 'We address your questions and issues first — quick help whenever you need it.' },
];

export default function LandingPage() {
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
                Practice Like the{' '}
                <span className="text-primary">Real Exam</span>
                <span className="text-saffron">.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed animate-fade-up" style={{ animationDelay: '160ms' }}>
                The authentic NTA test interface with previous year question
                papers and full-length test series. Same palette. Same timer.
                Same pressure.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-up" style={{ animationDelay: '240ms' }}>
                <Link to="/test?paper=02-apr-morning" className="cta-shimmer inline-flex items-center gap-2 text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98]">
                  Give a Demo Test for Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {showPricing && (
                  <Link to="/pricing" className="inline-flex items-center gap-2 bg-white text-gray-900 px-7 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-primary hover:text-primary transition-colors active:scale-[0.98]">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight font-display">Everything You Need to Crack JEE</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mt-3">Comprehensive preparation tools designed to help you ace the JEE Main exam.</p>
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
            <Link to="/test?paper=02-apr-morning" className="inline-flex items-center gap-2 bg-saffron text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-saffron-dark transition-colors shadow-lg shadow-black/20 hover:-translate-y-0.5 active:scale-[0.98]">
              Give a Demo Test for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

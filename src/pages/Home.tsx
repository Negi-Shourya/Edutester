import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Timer, Layers, LifeBuoy, Sparkles } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Layers, title: 'NTA-like Interface', description: 'Experience the exact same test interface as the actual exam conducted by NTA.' },
  { icon: BookOpen, title: 'Previous Year Papers', description: 'Practice full-length previous year question papers to simulate the real exam.' },
  { icon: Timer, title: 'Test Series', description: 'Chapter-wise and paper-wise test series designed to build exam confidence.' },
  { icon: LifeBuoy, title: 'Support', description: 'We address your questions and issues first — quick help whenever you need it.' },
];



export default function Home() {
  const { user } = useAuth();
  const startTarget = user ? '/paper-tests' : '/signup';
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              India's Most Affordable Test Platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Practice Like the{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Real Exam</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Practice on the authentic NTA test interface with previous year
              question papers and full-length test series. Start your exam
              preparation with the most affordable platform in India.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={startTarget} className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-xl text-sm font-semibold border border-gray-200 hover:border-primary transition-colors">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Crack Exams</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Comprehensive preparation tools designed to help you ace the JEE Main exam.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account in seconds and choose a plan that fits your needs.' },
              { step: '02', title: 'Choose Test', desc: 'Browse chapter-wise or paper-wise tests and start practicing.' },
              { step: '03', title: 'Practice & Improve', desc: 'Attempt tests on Edutester and track your progress.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Ace Your Exams?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">Join thousands of students who are already preparing with EduTester. Start your journey today.</p>
          <Link to="/paper-tests" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
            Start Testing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

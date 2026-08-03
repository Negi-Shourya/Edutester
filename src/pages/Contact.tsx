import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, MapPin, Clock, Heart, GraduationCap, BookOpen, Timer, Layers,
  LifeBuoy, CheckCircle2, Loader2, ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSubscriptionAccess } from '../lib/subscription';

const HOW_WE_HELP = [
  {
    icon: Layers,
    title: 'NTA-Like Interface',
    description:
      'Practice on the exact same interface used in the real exam — question palette, marking, and section navigation included.',
  },
  {
    icon: BookOpen,
    title: 'Previous Year Papers',
    description:
      'Attempt full-length previous year question papers to simulate the real exam and build stamina.',
  },
  {
    icon: Timer,
    title: 'Chapter-Wise Test Series',
    description:
      'Break each subject into manageable chapter tests so you can target and fix your weak topics one at a time.',
  },
  {
    icon: LifeBuoy,
    title: 'Always Affordable',
    description:
      "India's most affordable test platform. Plans start at ₹19/month so no student is left out of good practice.",
  },
];

export default function Contact() {
  const { hasAccess, loading: subscriptionLoading } = useSubscriptionAccess();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      if (insertError) throw new Error(insertError.message);
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Heart className="w-4 h-4" /> We're here to help
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 animate-fade-up">Contact Us</h1>
          <p className="text-indigo-100 max-w-2xl mx-auto">
            Questions, feedback, or a problem with your test? Send us a message
            and we'll get back to you quickly.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* About us */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-5 h-5" /> About EduTester
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We're Helping Students</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              EduTester exists for one reason — to give every exam aspirant
              access to realistic, affordable JEE practice. Here's how we do it.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {HOW_WE_HELP.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact info + form */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ways to reach us */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> How to Contact Us
              </h2>
              <ul className="space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email</div>
                    <a href="mailto:edutester4u@gmail.com" className="text-gray-500 hover:text-primary transition-colors">
                      edutester4u@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Response Time</div>
                    <p className="text-gray-500">Within 24 hours on business days</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Made in India</div>
                    <p className="text-gray-500">Built by students, for students</p>
                  </div>
                </li>
              </ul>
            </div>

            {!subscriptionLoading && !hasAccess && (
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-2">Having trouble with a test?</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                  Check the FAQ on our pricing page, or reach out directly — we
                  address student questions first.
                </p>
                <Link
                  to="/pricing#faq"
                  className="inline-flex items-center gap-1.5 bg-white text-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors"
                >
                  View FAQ <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1.5">Send Us a Message</h2>
            <p className="text-sm text-gray-500 mb-6">
              Fill in the form and we'll reply to your email as soon as we can.
            </p>

            {sent && (
              <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3.5 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                Thanks for reaching out! Your message has been sent — we'll get back to you shortly.
              </div>
            )}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this about?"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help…"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-y"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send Message <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

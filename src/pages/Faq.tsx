import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';
import Reveal from '../components/Reveal';
import { setPageMeta } from '../lib/pageMeta';

const faqs: { q: string; a: string }[] = [
  {
    q: 'What is included in the NEET test series 2026?',
    a: 'The NEET test series 2026 includes full-length NEET mock tests 2026 on the NTA pattern, NEET PYQ chapter-wise practice across Physics, Chemistry and Biology, and NEET previous year question papers — all with step-by-step solutions and instant scoring.',
  },
  {
    q: 'Are NEET PYQs with solutions included?',
    a: 'Yes. Every NEET PYQ on EduTester ships with a detailed step-by-step solution that explains the concept behind the answer, plus instant scoring and a weakness tracker that shows which chapters cost you marks.',
  },
  {
    q: 'Do you have NEET biology PYQs chapter-wise?',
    a: 'Yes. NEET biology PYQs are organised chapter-wise from high-weightage units like Genetics, Human Physiology, Biotechnology and Ecology, so you can drill one chapter at a time before attempting full NEET mock tests.',
  },
  {
    q: 'Are JEE Main previous year questions included?',
    a: 'Yes. The platform includes JEE Main previous year questions and JEE Main previous year papers with solutions, organised both paper-wise (full shifts) and as JEE Main PYQ chapter-wise tests for Physics, Chemistry and Mathematics.',
  },
  {
    q: 'Is there a JEE Main mock test 2026 on the NTA pattern?',
    a: 'Yes. JEE Main mock tests 2026 run on the authentic NTA interface — the same question palette, 3-hour timer, marking scheme and section navigation (Physics, Chemistry, Mathematics) as the real exam.',
  },
  {
    q: 'How much does the test series cost?',
    a: 'Plans start at ₹19 for 1 month, ₹50 for 3 months, ₹94 for 6 months and ₹159 for 1 year. Every plan unlocks the complete NEET online test series and JEE Main online test series — all chapter tests, papers and solutions.',
  },
  {
    q: 'Is there a free demo test?',
    a: 'Yes. You can attempt a free demo test on the real NTA interface without entering any payment details — just sign up and start.',
  },
  {
    q: 'Do I get step-by-step solutions for every question?',
    a: 'Yes. Both NEET previous year questions with solutions and JEE Main previous year papers with solutions include detailed explanations for every question, shown instantly after you submit a test.',
  },
  {
    q: 'Can I retake tests and track my progress?',
    a: 'Yes. Every test allows unlimited retakes, and your dashboard tracks scores, accuracy and weak chapters across the full NEET test series and JEE Mains test series 2026.',
  },
  {
    q: 'Which exams does EduTester cover?',
    a: 'JEE Main and NEET (UG). The question bank spans chapter-wise tests and previous year papers for Physics, Chemistry, Mathematics (JEE) and Physics, Chemistry, Botany, Zoology (NEET).',
  },
  {
    q: 'Do I need to install anything to take the tests?',
    a: 'No. The entire NEET online test series and JEE Main online test series run in your browser on mobile and desktop — no app install needed.',
  },
  {
    q: 'How do I subscribe?',
    a: 'Create an account, open the Pricing page, pick a plan and pay securely via Razorpay (UPI, cards, netbanking). Your subscription activates instantly.',
  },
];

export default function Faq() {
  useEffect(() => {
    setPageMeta(
      'FAQ — NEET Test Series 2026 & JEE Main Mock Test | EduTester',
      'Answers about EduTester NEET test series 2026, NEET PYQs with solutions, NEET biology PYQs, JEE Main mock tests 2026, pricing and subscriptions.'
    );
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <HelpCircle className="w-4 h-4" />
            NEET & JEE Test Series FAQ
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight font-display">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 mt-3">
            Everything about our NEET test series 2026, NEET PYQs with
            solutions and JEE Main mock tests — pricing, papers and features.
          </p>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((f) => (
            <Reveal key={f.q}>
              <details className="bg-white rounded-xl border border-gray-200 px-5 py-4 group">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-primary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-gray-600 text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-10">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
          >
            View Test Series Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

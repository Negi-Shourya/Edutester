import { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import TestCard from '../components/TestCard';
import PaywallModal from '../components/PaywallModal';
import StaggerReveal, { StaggerItem } from '../components/StaggerReveal';
import { chapterTests, subjects } from '../data/chapters';
import { FREE_TRIAL_TEST_ID, FREE_TRIAL_PAPER_KEY, useSubscriptionAccess } from '../lib/subscription';
import { useAttemptScore } from '../hooks/useAttemptScore';

export default function ChapterTests() {
  const [subject, setSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const { hasAccess, loading } = useSubscriptionAccess();

  // Chapter tests currently open the trial paper, so the user's submitted
  // score for that paper is what we can show here.
  const attemptScore = useAttemptScore(FREE_TRIAL_PAPER_KEY);
  const cardAttemptScore = attemptScore
    ? { score: attemptScore.totalScore, maxScore: attemptScore.maxScore }
    : null;

  const filtered = chapterTests.filter((t) => {
    const matchSubject = subject === 'All' || t.subject === subject;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.chapter?.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  const isLocked = (testId: string) =>
    !loading && !hasAccess && testId !== FREE_TRIAL_TEST_ID;
  const isTrial = (testId: string) => !loading && !hasAccess && testId === FREE_TRIAL_TEST_ID;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-display animate-fade-up">Chapter-wise Tests</h1>
          <p className="text-gray-500 mt-1">Master each topic with focused practice tests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chapter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['All', ...subjects].map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-target-40 ${
                    subject === s
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        {subject === 'All' ? (
          subjects.map((sub) => {
            const subTests = filtered.filter((t) => t.subject === sub);
            if (subTests.length === 0) return null;
            return (
              <div key={sub} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">{sub}</h2>
                  <span className="text-xs text-gray-400">({subTests.length} tests)</span>
                </div>
                <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subTests.map((test) => (
                    <StaggerItem key={test.id}>
                    <TestCard
                      test={test}
                      locked={isLocked(test.id)}
                      trial={isTrial(test.id)}
                      onLocked={() => setShowPaywall(true)}
                      attemptScore={isLocked(test.id) ? null : cardAttemptScore}
                    />
                    </StaggerItem>
                  ))}
                </StaggerReveal>
              </div>
            );
          })
        ) : (
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((test) => (
              <StaggerItem key={test.id}>
              <TestCard
                test={test}
                locked={isLocked(test.id)}
                trial={isTrial(test.id)}
                onLocked={() => setShowPaywall(true)}
                attemptScore={isLocked(test.id) ? null : cardAttemptScore}
              />
              </StaggerItem>
            ))}
          </StaggerReveal>
        )}

        {!loading && !hasAccess && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
            <span className="font-semibold">Free trial:</span>
            Try the Kinematics test for free. Subscribe to unlock all chapter tests.
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No tests found. Try a different search or filter.</p>
          </div>
        )}

        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, BookOpen, GraduationCap, FlaskConical, Atom, Calculator, Dna } from 'lucide-react';
import TestCard from '../components/TestCard';
import PaywallModal from '../components/PaywallModal';
import StaggerReveal, { StaggerItem } from '../components/StaggerReveal';
import { chapterTests, subjectsByExam, isChapterTrial } from '../data/chapters';
import { getExam, setExam, type ExamType } from '../lib/exam';
import { useAuth } from '../context/auth-context';
import { useSubscriptionAccess } from '../lib/subscription';
import { getAttempts, type AttemptRow } from '../lib/attemptsDb';

const SUBJECT_ICONS: Record<string, typeof Atom> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Mathematics: Calculator,
  Biology: Dna,
};

export default function ChapterTests() {
  const { user } = useAuth();
  const { hasAccess: hasSubscription } = useSubscriptionAccess();
  const [exam, setExamState] = useState<ExamType>(() => getExam());
  const [subject, setSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [dbAttempts, setDbAttempts] = useState<AttemptRow[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDbAttempts([]);
    getAttempts()
      .then((rows) => {
        if (!cancelled) setDbAttempts(rows.filter((r) => r.test_type === 'chapter'));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const dbAttemptByChapter = useMemo(
    () => new Map(dbAttempts.map((a) => [a.paper_key, a])),
    [dbAttempts]
  );

  const switchExam = (newExam: ExamType) => {
    setExamState(newExam);
    setExam(newExam);
    setSubject('All');
  };

  const currentSubjects = subjectsByExam[exam] ?? ['Physics', 'Chemistry'];

  const examTests = useMemo(() => {
    return chapterTests.filter((t) => t.exam === exam);
  }, [exam]);

  const filtered = useMemo(() => {
    return examTests.filter((t) => {
      const matchSubject = subject === 'All' || t.subject === subject;
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.chapter?.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [examTests, subject, search]);

  const scoreFor = (testId: string) => {
    const attempt = dbAttemptByChapter.get(testId);
    return attempt
      ? { score: attempt.total_score, maxScore: attempt.max_score }
      : null;
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Exam switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-stone-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => switchExam('jee')}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                exam === 'jee'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              JEE Main
            </button>
            <button
              onClick={() => switchExam('neet')}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                exam === 'neet'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              NEET
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 px-4 py-1.5 rounded-full text-sm text-stone-500 mb-3 shadow-sm">
            <span className={`w-2 h-2 rounded-full animate-pulse ${exam === 'jee' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            {exam === 'jee' ? 'JEE Main Chapter Practice · Physics, Chemistry & Maths' : 'NEET (UG) Chapter Practice · Physics, Chemistry & Biology'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight font-display animate-fade-up">
            Chapter-wise Tests
          </h1>
          <p className="text-stone-500 mt-2 max-w-lg mx-auto text-sm sm:text-base">
            {exam === 'jee'
              ? 'Master every concept across Physics, Chemistry, and Mathematics with selective question tests.'
              : 'Target high-yield topics across Physics, Chemistry, and Biology to boost your NEET rank.'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder={`Search ${exam === 'jee' ? 'JEE' : 'NEET'} chapters...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-stone-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {['All', ...currentSubjects].map((s) => {
                const count = s === 'All' ? examTests.length : examTests.filter((t) => t.subject === s).length;
                const Icon = s !== 'All' ? SUBJECT_ICONS[s] : null;
                const isSelected = subject === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? exam === 'jee'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
                    <span>{s}</span>
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${exam}-${subject}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {subject === 'All' ? (
              currentSubjects.map((sub) => {
                const subTests = filtered.filter((t) => t.subject === sub);
                if (subTests.length === 0) return null;
                const Icon = SUBJECT_ICONS[sub] ?? BookOpen;
                return (
                  <div key={sub} className="mb-10">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200/80">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          sub === 'Biology'
                            ? 'bg-emerald-100 text-emerald-700'
                            : sub === 'Chemistry'
                            ? 'bg-amber-100 text-amber-700'
                            : sub === 'Mathematics'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-semibold text-stone-800">{sub}</h2>
                        <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                          {subTests.length} tests
                        </span>
                      </div>
                    </div>
                    <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subTests.map((test) => {
                        const isTrial = isChapterTrial(test.id);
                        const locked = !hasSubscription && !isTrial;
                        const trial = !hasSubscription && isTrial;
                        return (
                          <StaggerItem key={test.id}>
                            <TestCard
                              test={test}
                              locked={locked}
                              trial={trial}
                              subscribed={hasSubscription}
                              onLocked={() => setShowPaywall(true)}
                              attemptScore={scoreFor(test.id)}
                            />
                          </StaggerItem>
                        );
                      })}
                    </StaggerReveal>
                  </div>
                );
              })
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200/80">
                  <div className="flex items-center gap-2.5">
                    {SUBJECT_ICONS[subject] && (
                      <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                        {(() => {
                          const Icon = SUBJECT_ICONS[subject];
                          return <Icon className="w-4 h-4" />;
                        })()}
                      </div>
                    )}
                    <h2 className="text-lg font-semibold text-stone-800">{subject}</h2>
                    <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      {filtered.length} tests
                    </span>
                  </div>
                </div>
                <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((test) => {
                    const isTrial = isChapterTrial(test.id);
                    const locked = !hasSubscription && !isTrial;
                    const trial = !hasSubscription && isTrial;
                    return (
                      <StaggerItem key={test.id}>
                        <TestCard
                          test={test}
                          locked={locked}
                          trial={trial}
                          subscribed={hasSubscription}
                          onLocked={() => setShowPaywall(true)}
                          attemptScore={scoreFor(test.id)}
                        />
                      </StaggerItem>
                    );
                  })}
                </StaggerReveal>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
                <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-stone-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-medium text-stone-700 mb-1">No chapter tests found</h3>
                <p className="text-sm text-stone-400 max-w-sm mx-auto">
                  Try adjusting your search query or switch to another subject tab.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Clock, Sunrise, Sunset, Lock, Gift, CheckCircle, GraduationCap, FlaskConical } from 'lucide-react';
import { getPapers, type PaperSummary } from '../data/questions';
import PaywallModal from '../components/PaywallModal';
import StaggerReveal, { StaggerItem } from '../components/StaggerReveal';
import { useSubscriptionAccess } from '../lib/subscription';
import { useAuth } from '../context/auth-context';
import { getAttempts, type AttemptRow } from '../lib/attemptsDb';
import { getExam, setExam, type ExamType } from '../lib/exam';

interface PaperEntry {
  date: string;
  day: string;
  shift: string;
  time: string;
  paper: string;
  link: string;
  variant: 'jee' | 'neet';
  minutes?: number;
}

function paperKeyOf(link: string): string {
  if (link === '/test') return '02-apr-morning';
  return new URLSearchParams(link.split('?')[1]).get('paper') ?? '';
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
}

function PaperEntryRow({
  entry,
  locked,
  trial,
  dbScore,
  onAttempt,
}: {
  entry: PaperEntry;
  locked: boolean;
  trial: boolean;
  dbScore: { totalScore: number; maxScore: number; accuracy: number } | null;
  onAttempt: (entry: PaperEntry) => void;
}) {
  // The database is the only source of marks here. This used to prefer a score
  // read out of localStorage, which is shared by every account on the browser —
  // so signing into a second account showed the first account's marks against
  // papers it had never attempted.
  const result = dbScore;
  const isMorning = entry.shift === 'Shift 1 (Morning)';
  const isNeet = entry.variant === 'neet';

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-stone-50/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isNeet
            ? 'bg-green-50 text-green-600'
            : isMorning
              ? 'bg-amber-50 text-amber-600'
              : 'bg-primary/10 text-primary'
        }`}>
          {isNeet ? <FlaskConical className="w-4 h-4" /> : isMorning ? <Sunrise className="w-4 h-4" /> : <Sunset className="w-4 h-4" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-700">{entry.shift}</span>
            {trial && (
              <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Gift className="w-2.5 h-2.5" />
                Free Trial
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock className="w-3 h-3 text-stone-300" />
            <span className="text-xs text-stone-400">{entry.time}</span>
          </div>
          {result && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-green-700">
              <CheckCircle className="w-3 h-3" />
              <span className="font-medium">Score: {result.totalScore}/{result.maxScore}</span>
              <span className="text-stone-400">({result.accuracy}% accuracy)</span>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onAttempt(entry)}
        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
          locked
            ? 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        {locked ? (
          <>
            <Lock className="w-3.5 h-3.5" />
            Unlock
          </>
        ) : (
          <>
            {result ? 'Retake' : 'Attempt'}
            <ExternalLink className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}

interface SessionGroup {
  id: string;
  label: string;
  subtitle: string;
  accent: string;
  badge: string;
  papers: PaperEntry[];
}

const jan2026Papers: PaperEntry[] = [
  { date: '21 Jan 2026', day: 'Wednesday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '21 Jan 2026', day: 'Wednesday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '22 Jan 2026', day: 'Thursday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '22 Jan 2026', day: 'Thursday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '23 Jan 2026', day: 'Friday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '23 Jan 2026', day: 'Friday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '24 Jan 2026', day: 'Saturday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '24 Jan 2026', day: 'Saturday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '28 Jan 2026', day: 'Wednesday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
  { date: '28 Jan 2026', day: 'Wednesday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test', variant: 'jee' },
];

const comingSoon = [
  { year: 2025, label: '2025' },
  { year: 2024, label: '2024' },
  { year: 2023, label: '2023' },
];

const seededYears = (papers: PaperSummary[]) =>
  new Set(papers.map((p) => new Date(`${p.examDate}T00:00:00`).getFullYear()));

function groupByDate(papers: PaperEntry[]) {
  const groups: Record<string, PaperEntry[]> = {};
  for (const p of papers) {
    if (!groups[p.date]) groups[p.date] = [];
    groups[p.date].push(p);
  }
  return groups;
}

export default function PaperTests() {
  const [exam, setExamState] = useState<ExamType>(getExam());
  const [expanded, setExpanded] = useState<string>('apr-2026');
  const [papersLoading, setPapersLoading] = useState(true);
  const [papersError, setPapersError] = useState<string | null>(null);
  const [dbPapers, setDbPapers] = useState<PaperSummary[]>([]);
  const [dbAttempts, setDbAttempts] = useState<AttemptRow[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const { hasAccess, loading } = useSubscriptionAccess();
  const { user } = useAuth();
  const navigate = useNavigate();

  const jeePapers = useMemo(
    () => dbPapers.filter((p) => p.examType === 'jee'),
    [dbPapers]
  );
  const neetPapers = useMemo(
    () => dbPapers.filter((p) => p.examType === 'neet'),
    [dbPapers]
  );

  // NEET papers grouped by year (2026 → 2023).
  const neetYearGroups = useMemo(() => {
    const byYear = new Map<number, PaperEntry[]>();
    for (const p of neetPapers) {
      const year = new Date(`${p.examDate}T00:00:00`).getFullYear();
      const date = new Date(`${p.examDate}T00:00:00`);
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push({
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        shift: p.title,
        time: formatDuration(p.durationMinutes),
        paper: p.fullTitle,
        link: `/test?paper=${p.key}`,
        variant: 'neet',
        minutes: p.durationMinutes,
      });
    }
    return [...byYear.entries()].sort(([a], [b]) => b - a);
  }, [neetPapers]);

  // Free papers are exactly the rows flagged `is_trial` in the database — the
  // same rule score-attempt applies server-side. Looked up by resolved paper
  // key rather than per entry, so the January placeholders (which all link to
  // bare `/test`) inherit the trial status of the paper they actually open.
  //
  // The old version also hardcoded JEE 02-apr-morning by name. That row already
  // carries the flag, so the clause was redundant, and it masked the real bug:
  // TestInterface gated on that one key and ignored `is_trial` entirely, so a
  // flagged NEET paper was badged "Free Trial" here, opened, then hit a paywall.
  const trialKeys = useMemo(
    () => new Set(dbPapers.filter((p) => p.isTrial).map((p) => p.key)),
    [dbPapers]
  );
  const isFree = (entry: PaperEntry) => trialKeys.has(paperKeyOf(entry.link));

  const isLocked = (entry: PaperEntry) => {
    if (loading || hasAccess) return false;
    return !isFree(entry);
  };
  const isTrial = (entry: PaperEntry) => {
    if (loading || hasAccess) return false;
    return isFree(entry);
  };

  const handleAttempt = (entry: PaperEntry) => {
    if (isLocked(entry)) {
      setShowPaywall(true);
      return;
    }
    navigate(entry.link);
  };

  const switchExam = (next: ExamType) => {
    setExam(next);
    setExamState(next);
  };

  useEffect(() => {
    let cancelled = false;
    getPapers()
      .then((papers) => {
        if (cancelled) return;
        setDbPapers(papers);
      })
      .catch((err: unknown) => {
        if (!cancelled) setPapersError(err instanceof Error ? err.message : 'Failed to load papers.');
      })
      .finally(() => {
        if (!cancelled) setPapersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDbAttempts([]);
    getAttempts()
      .then((rows) => {
        if (!cancelled) setDbAttempts(rows.filter((r) => r.test_type === 'paper'));
      })
      .catch(() => {
        // Marks stay hidden rather than falling back to browser storage.
      });
    return () => {
      cancelled = true;
    };
    // Re-fetches on sign-in/sign-out so one account's marks are never left on
    // screen for the next.
  }, [user?.id]);

  const dbAttemptByPaper = useMemo(
    () => new Map(dbAttempts.map((a) => [a.paper_key, a])),
    [dbAttempts]
  );

  const dbScoreFor = (entry: PaperEntry): { totalScore: number; maxScore: number; accuracy: number } | null => {
    const attempt = dbAttemptByPaper.get(paperKeyOf(entry.link));
    return attempt
      ? { totalScore: attempt.total_score, maxScore: attempt.max_score, accuracy: attempt.accuracy }
      : null;
  };

  const apr2026Entries: PaperEntry[] = useMemo(
    () =>
      jeePapers.map((p) => {
        const date = new Date(`${p.examDate}T00:00:00`);
        const isMorning = p.session === 'morning';
        return {
          date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          day: date.toLocaleDateString('en-US', { weekday: 'long' }),
          shift: isMorning ? 'Shift 1 (Morning)' : 'Shift 2 (Evening)',
          time: isMorning ? '9:00 AM – 12:00 PM' : '3:00 PM – 6:00 PM',
          paper: 'B.E./B.Tech. (Paper 1)',
          link: `/test?paper=${p.key}`,
          variant: 'jee',
        };
      }),
    [jeePapers]
  );

  const sessions: SessionGroup[] = [
    {
      id: 'apr-2026',
      label: 'April 2026',
      subtitle: 'Session 2',
      accent: 'from-amber-50 to-orange-50',
      badge: 'Session 2',
      papers: apr2026Entries,
    },
    {
      id: 'jan-2026',
      label: 'January 2026',
      subtitle: 'Session 1',
      accent: 'from-sky-50 to-blue-50',
      badge: 'Session 1',
      papers: jan2026Papers,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Exam switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-stone-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => switchExam('jee')}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                exam === 'jee' ? 'bg-primary text-white shadow' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              JEE Main
            </button>
            <button
              onClick={() => switchExam('neet')}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                exam === 'neet' ? 'bg-green-600 text-white shadow' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              NEET
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 px-4 py-1.5 rounded-full text-sm text-stone-500 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {exam === 'jee' ? 'JEE Main 2026 papers now available' : 'NEET (UG) 2026 papers now available'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 tracking-tight font-display animate-fade-up">
            Paper-wise Tests
          </h1>
          <p className="text-stone-400 mt-2 max-w-md mx-auto">
            {exam === 'jee'
              ? 'Practice with actual JEE Main question papers, one shift at a time.'
              : 'Practice with actual NEET (UG) question papers, one year at a time.'}
          </p>
        </div>

        {exam === 'neet' ? (
          /* NEET papers grouped by year */
          <div className="space-y-6">
            {papersError && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {papersError}
              </div>
            )}
            {neetYearGroups.map(([year, entries]) => (
              <div key={year} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-base font-medium text-stone-800">NEET (UG) {year}</h2>
                      <p className="text-xs text-stone-400">{entries.length} paper{entries.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {papersLoading && (
                    <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
                      Loading…
                    </span>
                  )}
                </div>
                <div className="px-6 py-4 space-y-3 border-t border-stone-50">
                  {entries.map((entry, i) => (
                    <div key={i} className="border border-stone-100 rounded-xl overflow-hidden">
                      <div className="bg-stone-50/80 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-medium text-stone-700">{entry.date}</span>
                          <span className="text-xs text-stone-400 bg-white px-2 py-0.5 rounded-full">{entry.day}</span>
                        </div>
                        <span className="text-xs text-stone-400">{formatDuration(entry.minutes ?? 180)}</span>
                      </div>
                      <PaperEntryRow
                        entry={entry}
                        locked={isLocked(entry)}
                        trial={isTrial(entry)}
                        dbScore={dbScoreFor(entry)}
                        onAttempt={handleAttempt}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!papersLoading && neetYearGroups.length === 0 && (
              <div className="text-center py-16 text-stone-400 text-sm">
                NEET papers are being added. Check back soon.
              </div>
            )}
          </div>
        ) : (
          /* JEE papers: session list */
          <div className="space-y-6">
            {sessions.map((session) => {
              const isOpen = expanded === session.id;
              const groups = groupByDate(session.papers);

              return (
                <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                  {/* Session Header */}
                  <button
                    onClick={() => setExpanded(isOpen ? '' : session.id)}
                    className={`w-full flex items-center justify-between px-6 py-5 transition-colors ${
                      isOpen ? 'border-b border-stone-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${session.accent} flex items-center justify-center`}>
                        <span className="text-sm font-semibold text-stone-700">
                          {session.label === 'April 2026' ? 'A' : 'J'}
                        </span>
                      </div>
                      <div className="text-left">
                        <h2 className="text-base font-medium text-stone-800">{session.label}</h2>
                        <p className="text-xs text-stone-400">{session.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {papersLoading && session.id === 'apr-2026' && (
                        <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
                          Loading…
                        </span>
                      )}
                      {!papersLoading && (
                        <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
                          {session.papers.length} shifts
                        </span>
                      )}
                      <div className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Papers */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="papers"
                        className="px-6 py-4 space-y-3 overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {papersError && session.id === 'apr-2026' && (
                          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            {papersError}
                          </div>
                        )}
                        {Object.entries(groups).map(([date, entries]) => (
                          <div key={date} className="border border-stone-100 rounded-xl overflow-hidden">
                            <div className="bg-stone-50/80 px-4 py-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm font-medium text-stone-700">{date}</span>
                                <span className="text-xs text-stone-400 bg-white px-2 py-0.5 rounded-full">{entries[0].day}</span>
                              </div>
                              <span className="text-xs text-stone-400">{entries.length} shift{entries.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="divide-y divide-stone-50">
                              {entries.map((entry, i) => (
                                <PaperEntryRow
                                  key={i}
                                  entry={entry}
                                  locked={isLocked(entry)}
                                  trial={isTrial(entry)}
                                  dbScore={dbScoreFor(entry)}
                                  onAttempt={handleAttempt}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Coming Soon */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-stone-400 mb-3 text-center">Previous Years</h3>
              <StaggerReveal className="grid grid-cols-3 gap-3">
                {comingSoon
                  .filter((y) => !seededYears(dbPapers).has(y.year))
                  .map((y) => (
                  <StaggerItem key={y.year}>
                    <div className="bg-white rounded-xl border border-stone-100 p-5 text-center shadow-sm">
                      <div className="text-xl font-light text-stone-300 mb-1">{y.year}</div>
                      <span className="text-xs text-stone-300 bg-stone-50 px-3 py-1 rounded-full">Coming Soon</span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-300">
            Placeholder links &middot; Actual papers will be added as they become available.
          </p>
        </div>

        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react';
import {
  BookOpen, FileText, TrendingUp, TrendingDown, Minus, Clock, BarChart3, Target,
  ArrowRight, Play, AlertCircle, LineChart, Award, ChevronRight, ChevronDown,
  Lightbulb, CheckCircle2, XCircle, SkipForward
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { getAttempts, backfillLocalAttempts, type AttemptRow } from '../lib/attemptsDb';
import { findInProgressAttempt, type SavedAttempt } from '../lib/attemptStorage';
import { useSubscriptionAccess } from '../lib/subscription';
import { getExam, setExam, examOfPaperKey, type ExamType } from '../lib/exam';
import { GraduationCap } from 'lucide-react';
import {
  loadQuestionMeta, analyzeTest, analyzeOverall, type TestAnalysis, type SubjectOverall,
  type Recommendation,
} from '../lib/dashboard';
import {
  analyzeChapters, chaptersForSubject, mergePaperChapters, type ChapterPerformance,
} from '../lib/chapterAnalysis';
import { loadChapterIndex } from '../lib/questionChapterMap';

const SECTION_COLORS: Record<string, string> = {
  Physics: 'bg-blue-500',
  Chemistry: 'bg-emerald-500',
  Mathematics: 'bg-saffron',
  Biology: 'bg-green-500',
  Botany: 'bg-lime-500',
  Zoology: 'bg-teal-500',
};

const TREND_ICONS: Record<SubjectOverall['trend'], { icon: React.ReactNode; cls: string }> = {
  up: { icon: <TrendingUp className="w-3.5 h-3.5" />, cls: 'text-green-600' },
  down: { icon: <TrendingDown className="w-3.5 h-3.5" />, cls: 'text-red-500' },
  flat: { icon: <Minus className="w-3.5 h-3.5" />, cls: 'text-gray-400' },
};

const PRIORITY_BADGE: Record<Recommendation['priority'], string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-green-50 text-green-700',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDuration(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function pctClass(pct: number): string {
  if (pct >= 60) return 'text-green-600';
  if (pct >= 40) return 'text-amber-600';
  return 'text-red-500';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { hasAccess: hasSubscription, loading: subscriptionLoading } = useSubscriptionAccess();
  const [exam, setExamState] = useState<ExamType>(getExam());
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null);
  const [analyses, setAnalyses] = useState<TestAnalysis[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState<SavedAttempt | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'paper' | 'chapter'>('all');
  // Test history shows the 7 most recent tests; "Show more" reveals the rest.
  const [showAllHistory, setShowAllHistory] = useState(false);
  const HISTORY_VISIBLE = 7;

  useEffect(() => {
    let cancelled = false;
    setAttempts(null);
    setAnalyses(null);
    (async () => {
      const userId = user?.id ?? '';
      setInProgress(findInProgressAttempt(userId));

      // Run backfill in background without blocking dashboard render
      void backfillLocalAttempts(userId);

      // Fetch attempts directly from database
      const rows = await getAttempts();
      if (cancelled) return;

      // Immediately render stats, cards and history with zero delay
      setAttempts(rows);
      setAnalyses(rows.map((r) => analyzeTest(r)));

      // Enriched question metadata loads asynchronously and updates insights
      loadQuestionMeta(rows).then((meta) => {
        if (!cancelled) {
          setAnalyses(rows.map((r) => analyzeTest(r, meta.get(r.paper_key))));
        }
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const trackAttempts = useMemo(
    () => attempts?.filter((r) => examOfPaperKey(r.paper_key) === exam) ?? null,
    [attempts, exam]
  );
  const trackAnalyses = useMemo(
    () => analyses?.filter((a) => examOfPaperKey(a.row.paper_key) === exam) ?? null,
    [analyses, exam]
  );
  const otherTrackCount = useMemo(
    () => (attempts ?? []).filter((r) => examOfPaperKey(r.paper_key) !== exam).length,
    [attempts, exam]
  );

  const stats = useMemo(() => {
    const rows = trackAttempts ?? [];
    const n = rows.length;
    const avgAccuracy = n > 0 ? Math.round(rows.reduce((s, r) => s + r.accuracy, 0) / n) : 0;
    const avgScorePct =
      n > 0
        ? Math.round(
            rows.reduce((s, r) => s + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0), 0) /
              n
          )
        : 0;
    const best = rows.reduce<AttemptRow | null>(
      (b, r) =>
        b === null ||
        (r.max_score > 0 &&
          (r.total_score / r.max_score) > (b.max_score > 0 ? b.total_score / b.max_score : 0))
          ? r
          : b,
      null
    );
    const bestPct = best && best.max_score > 0 ? Math.round((best.total_score / best.max_score) * 100) : 0;
    const timePracticed = rows.reduce((s, r) => s + r.time_spent, 0);
    const questionsSolved = rows.reduce((s, r) => s + r.correct + r.incorrect, 0);
    return { n, avgAccuracy, avgScorePct, bestPct, timePracticed, questionsSolved };
  }, [trackAttempts]);

  const overall = useMemo(
    () => (trackAttempts && trackAnalyses ? analyzeOverall(trackAttempts, trackAnalyses) : null),
    [trackAttempts, trackAnalyses]
  );

  // Chapter-level signal. Chapter-test attempts map to chapters directly;
  // full-paper questions are attributed via the question→chapter index
  // (chapter tests were carved out of papers). Merged async — the sync base
  // renders instantly, paper-derived stats join in when the index loads.
  const chapterBase = useMemo(
    () => analyzeChapters(trackAttempts ?? []),
    [trackAttempts]
  );
  const [mergedChapters, setMergedChapters] = useState<ChapterPerformance[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    setMergedChapters(null);
    const rows = trackAttempts ?? [];
    if (rows.length === 0) {
      setMergedChapters([]);
      return;
    }
    loadChapterIndex().then((index) => {
      if (cancelled) return;
      setMergedChapters(mergePaperChapters(analyzeChapters(rows), rows, index));
    });
    return () => {
      cancelled = true;
    };
  }, [trackAttempts]);
  const chapterPerf = mergedChapters ?? chapterBase;

  // "What to Work On": weakest chapters first (deep link to that chapter's
  // test), then the generic subject/habit recommendations.
  const recommendations = useMemo<Recommendation[] | null>(() => {
    if (!overall) return null;
    const chapterRecs: Recommendation[] = chapterPerf
      .filter((c) => c.isWeak)
      .slice(0, 2)
      .map((c) => ({
        priority: (c.avgAccuracy < 45 ? 'high' : 'medium') as Recommendation['priority'],
        title: `Fix ${c.title}`,
        detail: `${c.avgAccuracy}% accuracy across ${c.attempts} ${c.attempts === 1 ? 'attempt' : 'attempts'} in ${c.subject}. Revise the chapter, then retake its test.`,
        ctaLabel: `Practice ${c.title}`,
        ctaTo: `/test?chapter=${c.chapterId}`,
      }));
    return [...chapterRecs, ...overall.recommendations].slice(0, 4);
  }, [overall, chapterPerf]);

  const filteredAnalyses = useMemo(() => {
    if (!trackAnalyses) return null;
    if (historyFilter === 'all') return trackAnalyses;
    return trackAnalyses.filter((a) => {
      const isCh =
        a.row.test_type === 'chapter' ||
        a.row.paper_key.startsWith('jee-') ||
        a.row.paper_key.startsWith('neet-') ||
        a.row.paper_key.startsWith('ch-');
      return historyFilter === 'chapter' ? isCh : !isCh;
    });
  }, [trackAnalyses, historyFilter]);

  const paperCount = useMemo(
    () =>
      (trackAnalyses ?? []).filter(
        (a) =>
          a.row.test_type !== 'chapter' &&
          !a.row.paper_key.startsWith('jee-') &&
          !a.row.paper_key.startsWith('neet-') &&
          !a.row.paper_key.startsWith('ch-')
      ).length,
    [trackAnalyses]
  );

  const chapterCount = useMemo(
    () =>
      (trackAnalyses ?? []).filter(
        (a) =>
          a.row.test_type === 'chapter' ||
          a.row.paper_key.startsWith('jee-') ||
          a.row.paper_key.startsWith('neet-') ||
          a.row.paper_key.startsWith('ch-')
      ).length,
    [trackAnalyses]
  );

  const loading = attempts === null || analyses === null;
  const rows = trackAttempts ?? [];
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there';

  const inProgressIsChapter = inProgress?.paperKey
    ? inProgress.paperKey.startsWith('jee-') ||
      inProgress.paperKey.startsWith('neet-') ||
      inProgress.paperKey.startsWith('ch-')
    : false;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display animate-fade-up">Welcome back, {firstName}!</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Your test history, performance & growth — at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Exam track switch */}
            <div className="inline-flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              <button
                onClick={() => { setExam('jee'); setExamState('jee'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  exam === 'jee' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                JEE
              </button>
              <button
                onClick={() => { setExam('neet'); setExamState('neet'); }}
                className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  exam === 'neet' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                NEET
              </button>
            </div>
            <Link
              to="/paper-tests"
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              Take a Test
            </Link>
          </div>
        </div>

        {inProgress && !inProgress.isTestSubmitted && (
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-lg shadow-primary/20 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wide mb-1.5">
                  <Clock className="w-4 h-4" /> Resume where you left off
                </div>
                <h2 className="text-xl font-bold mb-1">You have a {inProgressIsChapter ? 'chapter test' : 'full paper'} in progress</h2>
                <p className="text-indigo-100 text-sm">Pick up right where you stopped.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to={inProgressIsChapter ? `/test?chapter=${inProgress.paperKey}` : `/test?paper=${inProgress.paperKey}`}
                  className="flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-md active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Resume Test
                </Link>
                <Link
                  to={inProgressIsChapter ? "/chapter-tests" : "/paper-tests"}
                  className="flex items-center justify-center gap-2 bg-white/15 text-white border border-white/30 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors"
                >
                  Start New Test
                </Link>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Loading your dashboard…</p>
          </div>
        ) : rows.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No {exam.toUpperCase()} tests taken yet
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {otherTrackCount > 0 ? (
                <>
                  Your {exam === 'jee' ? 'NEET' : 'JEE'} history is under the{' '}
                  {exam === 'jee' ? 'NEET' : 'JEE'} track — switch above to see it.
                  Attempt a {exam.toUpperCase()} paper or chapter test and its results, weak areas,
                  and what to work on next will show up here.
                </>
              ) : (
                <>
                  Attempt your first full paper or chapter test and your results,
                  per-test learning, weak areas, and what to work on next will show up here.
                </>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/paper-tests"
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                <FileText className="w-4 h-4" /> Paper-wise Tests
              </Link>
              <Link
                to="/chapter-tests"
                className="flex items-center justify-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Chapter Tests
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={<BookOpen className="w-5 h-5 text-white" />}
                color="from-blue-500 to-blue-600"
                value={String(stats.n)}
                label="Tests Completed"
                sub={`${chapterCount} chapter, ${paperCount} full papers`}
              />
              <StatCard
                icon={<Target className="w-5 h-5 text-white" />}
                color="from-green-500 to-green-600"
                value={String(stats.questionsSolved)}
                label="Questions Solved"
                sub="across all attempts"
              />
              <StatCard
                icon={<Award className="w-5 h-5 text-white" />}
                color="from-purple-500 to-purple-600"
                value={`${stats.avgScorePct}%`}
                label="Avg. Score"
                sub="percentage of max score"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-white" />}
                color="from-saffron to-saffron-dark"
                value={`${stats.bestPct}%`}
                label="Best Score"
                sub="single test"
              />
              <StatCard
                icon={<BarChart3 className="w-5 h-5 text-white" />}
                color="from-orange-500 to-orange-600"
                value={`${stats.avgAccuracy}%`}
                label="Avg. Accuracy"
                sub="across all tests"
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-white" />}
                color="from-rose-500 to-rose-600"
                value={formatDuration(stats.timePracticed)}
                label="Time Practiced"
                sub="total time spent"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">

                {/* Score trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-primary" />
                      Score Trend
                    </h2>
                    <span className="text-xs text-gray-400">last {Math.min(rows.length, 10)} tests</span>
                  </div>
                  <div className="flex items-end gap-2 sm:gap-3 h-40">
                    {rows.slice(0, 10).reverse().map((row, i) => {
                      const pct = row.max_score > 0 ? (row.total_score / row.max_score) * 100 : 0;
                      return (
                        <div key={row.id} className="flex-1 flex flex-col items-center gap-1.5 min-w-0" title={`${row.title}\n${row.total_score}/${row.max_score} (${Math.round(pct)}%)`}>
                          <span className={`text-[10px] font-semibold ${pctClass(pct)}`}>
                            {Math.round(pct)}%
                          </span>
                          <motion.div
                            className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-primary to-primary-light"
                            style={{ height: `${Math.max(pct, 3)}%`, transformOrigin: 'bottom' }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          />
                          <span className="text-[10px] text-gray-400 truncate w-full text-center">
                            {formatDate(row.created_at)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Test history */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h2 className="font-semibold text-gray-900">Test History</h2>
                      <span className="text-xs text-gray-400">({rows.length} total)</span>
                    </div>

                    {/* Filter tabs */}
                    <div className="inline-flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
                      <button
                        onClick={() => { setHistoryFilter('all'); setShowAllHistory(false); }}
                        className={`px-3 py-1 rounded-md transition-all ${
                          historyFilter === 'all'
                            ? 'bg-white text-gray-900 shadow-xs font-semibold'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        All ({trackAnalyses?.length ?? 0})
                      </button>
                      <button
                        onClick={() => { setHistoryFilter('chapter'); setShowAllHistory(false); }}
                        className={`px-3 py-1 rounded-md transition-all ${
                          historyFilter === 'chapter'
                            ? 'bg-white text-purple-700 shadow-xs font-semibold'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Chapters ({chapterCount})
                      </button>
                      <button
                        onClick={() => { setHistoryFilter('paper'); setShowAllHistory(false); }}
                        className={`px-3 py-1 rounded-md transition-all ${
                          historyFilter === 'paper'
                            ? 'bg-white text-blue-700 shadow-xs font-semibold'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Papers ({paperCount})
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredAnalyses && filteredAnalyses.length > 0 ? (
                      <>
                        {(showAllHistory ? filteredAnalyses : filteredAnalyses.slice(0, HISTORY_VISIBLE)).map((a) => (
                          <TestHistoryCard
                            key={a.row.id}
                            analysis={a}
                            expanded={expanded === a.row.id}
                            onToggle={() => setExpanded(expanded === a.row.id ? null : a.row.id)}
                          />
                        ))}
                        {filteredAnalyses.length > HISTORY_VISIBLE && (
                          <button
                            onClick={() => setShowAllHistory(!showAllHistory)}
                            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors"
                          >
                            {showAllHistory ? (
                              <>
                                Show less
                                <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                              </>
                            ) : (
                              <>
                                Show more ({filteredAnalyses.length - HISTORY_VISIBLE} more)
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                        No {historyFilter === 'chapter' ? 'chapter tests' : 'paper tests'} recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Weak areas */}
                {overall && overall.subjects.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h2 className="font-semibold text-gray-900">Overall Weak Areas</h2>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Ranked weakest first, with your recent trend — tap a subject to see its weak chapters
                    </p>
                    <div className="space-y-4">
                      {[...overall.subjects]
                        .sort((a, b) => a.avgAccuracy - b.avgAccuracy)
                        .map((sub) => (
                          <SubjectRow
                            key={sub.section}
                            sub={sub}
                            chapters={chaptersForSubject(chapterPerf, sub.section, exam)}
                            expanded={expandedSubject === sub.section}
                            onToggle={() =>
                              setExpandedSubject(expandedSubject === sub.section ? null : sub.section)
                            }
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {recommendations && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      What to Work On
                    </h2>
                    <div className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-3.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${PRIORITY_BADGE[rec.priority]}`}>
                              {rec.priority}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{rec.title}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-2.5">{rec.detail}</p>
                          <Link
                            to={rec.ctaTo}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            {rec.ctaLabel} <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    >
                      <Link to="/chapter-tests" className="flex flex-col items-center gap-2 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors group">
                        <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Chapter</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    >
                      <Link to="/paper-tests" className="flex flex-col items-center gap-2 p-4 bg-saffron/10 rounded-xl hover:bg-saffron/20 transition-colors group">
                        <FileText className="w-6 h-6 text-saffron group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Full Paper</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                    >
                      <Link to="/profile" className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                        <Award className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">My Plan</span>
                      </Link>
                    </motion.div>
                    {!subscriptionLoading && !hasSubscription && (
                      <motion.div
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                      >
                        <Link to="/pricing" className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group">
                          <ArrowRight className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-gray-700">Upgrade</span>
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Subscription CTA — hidden for paying users */}
                {!subscriptionLoading && !hasSubscription && (
                  <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-5">
                    <h3 className="text-white font-semibold text-sm mb-1.5">Unlock every paper & chapter</h3>
                    <p className="text-indigo-100 text-xs mb-4 leading-relaxed">
                      Get access to all 54 chapter tests, full papers, and the complete test series.
                    </p>
                    <Link to="/pricing" className="flex items-center justify-center gap-1.5 bg-white text-primary px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition-colors">
                      View Plans <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, color, value, label, sub }: {
  icon: React.ReactNode;
  color: string;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start justify-between mb-3">
        <motion.div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}
          whileHover={{ scale: 1.12, rotate: -6 }}
          transition={{ type: 'spring', stiffness: 320, damping: 14 }}
        >
          {icon}
        </motion.div>
      </div>
      <div className="text-2xl font-bold text-gray-900 font-mono">
        <CountUp value={value} />
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
    </motion.div>
  );
}

function CountUp({ value }: { value: string }) {
  const match = /^(\d+(?:\.\d+)?)(%?)$/.exec(value);
  const target = match ? parseFloat(match[1]) : null;
  const suffix = match?.[2] ?? '';

  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (target === null) return;
    const controls = animate(mv, target, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [target, mv]);

  if (target === null) return <>{value}</>;
  return <motion.span>{text}</motion.span>;
}

function SubjectRow({ sub, chapters, expanded, onToggle }: {
  sub: SubjectOverall;
  chapters: ChapterPerformance[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const color = SECTION_COLORS[sub.section] ?? 'bg-gray-500';
  const trend = TREND_ICONS[sub.trend];
  return (
    <div>
      <button onClick={onToggle} className="w-full text-left group">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-900 font-medium flex items-center gap-1.5">
            {sub.section}
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">{sub.avgAccuracy}% accuracy</span>
            <span className={trend.cls}>{trend.icon}</span>
          </span>
        </div>
      </button>
      <div className="text-[11px] text-gray-400 mb-1.5">
        {sub.attempts} {sub.attempts === 1 ? 'test' : 'tests'} · {sub.avgScorePct}% score
        {sub.recentAccuracy !== null && sub.previousAccuracy !== null
          ? ` · recent ${sub.recentAccuracy}% (was ${sub.previousAccuracy}%)`
          : ''}
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            sub.avgAccuracy < 50 ? 'bg-red-400' : sub.avgAccuracy < 70 ? 'bg-amber-400' : color
          }`}
          style={{ width: `${sub.avgAccuracy}%` }}
        />
      </div>

      {/* Chapter drill-down: weakest chapters of this subject first */}
      {expanded && (
        <div className="mt-2.5 ml-1 pl-3 border-l-2 border-gray-100 space-y-2.5">
          {chapters.length === 0 ? (
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Nothing mapped to {sub.section} yet — take a chapter test or a
              full paper and the weak chapters will appear here.
              <Link
                to="/chapter-tests"
                className="inline-flex items-center gap-0.5 ml-1 font-semibold text-primary hover:underline"
              >
                Browse chapters <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          ) : (
            chapters.map((ch) => (
              <div key={ch.chapterId}>
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className={`font-medium ${ch.isWeak ? 'text-red-600' : 'text-gray-700'}`}>
                    {ch.title}
                  </span>
                  <span className={`font-mono font-semibold ${pctClass(ch.avgAccuracy)}`}>
                    {ch.avgAccuracy}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mb-1">
                  <div
                    className={`h-1 rounded-full ${
                      ch.avgAccuracy < 50 ? 'bg-red-400' : ch.avgAccuracy < 70 ? 'bg-amber-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${ch.avgAccuracy}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>
                    {ch.questions} {ch.questions === 1 ? 'question' : 'questions'} · {ch.attempts} {ch.attempts === 1 ? 'test' : 'tests'}
                  </span>
                  <Link
                    to={`/test?chapter=${ch.chapterId}`}
                    className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" /> Practice
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TestHistoryCard({ analysis, expanded, onToggle }: {
  analysis: TestAnalysis;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { row, scorePct, sections, insights } = analysis;
  const isChapter =
    row.test_type === 'chapter' ||
    row.paper_key.startsWith('jee-') ||
    row.paper_key.startsWith('neet-') ||
    row.paper_key.startsWith('ch-');

  const insightIcon = (kind: TestAnalysis['insights'][number]['kind']) => {
    switch (kind) {
      case 'positive':
        return <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />;
      default:
        return <SkipForward className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />;
    }
  };
  const insightBars: Record<TestAnalysis['insights'][number]['kind'], string> = {
    positive: 'bg-green-50 border-green-100',
    warning: 'bg-amber-50 border-amber-100',
    danger: 'bg-red-50 border-red-100',
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-xs">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 truncate">{row.title}</span>
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isChapter
                    ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                    : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                }`}
              >
                {isChapter ? 'Chapter Test' : 'Full Paper'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDateTime(row.created_at)} · {formatDuration(row.time_spent)} spent
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {row.total_score}<span className="text-sm text-gray-400 font-normal">/{row.max_score}</span>
              </div>
              <div className={`text-xs font-medium ${pctClass(scorePct)}`}>{scorePct}%</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {row.correct} <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              {row.incorrect} <XCircle className="w-3.5 h-3.5 text-red-500" />
              {row.unattempted} <SkipForward className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => (
            <span
              key={sec.section}
              className={`text-xs px-2 py-1 rounded-md font-medium ${
                sec.accuracy >= 70
                  ? 'bg-green-50 text-green-700'
                  : sec.accuracy >= 40
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-600'
              }`}
            >
              {sec.section}: {sec.score}/{sec.maxScore} ({sec.accuracy}%)
            </span>
          ))}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2.5">
                Section-wise Performance
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sections.map((sec) => {
                  const color = SECTION_COLORS[sec.section] ?? 'bg-gray-500';
                  return (
                    <div key={sec.section} className="bg-white border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">{sec.section}</span>
                        <span className={`text-xs font-bold ${pctClass(sec.scorePct)}`}>{sec.scorePct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2.5">
                        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${sec.scorePct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" /> {sec.correct}
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-500" /> {sec.incorrect}
                        </span>
                        <span className="flex items-center gap-1">
                          <SkipForward className="w-3 h-3 text-gray-400" /> {sec.unattempted}
                        </span>
                        <span className="font-medium">{sec.accuracy}% acc</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning from this test */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                What this test taught you
              </h4>
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 border rounded-xl px-3 py-2.5 ${insightBars[ins.kind]}`}
                  >
                    {insightIcon(ins.kind)}
                    <p className="text-xs text-gray-700 leading-relaxed">{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Retake and navigation bar */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
              <Link
                to={isChapter ? `/test?chapter=${row.paper_key}` : `/test?paper=${row.paper_key}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Play className="w-3 h-3 fill-current" /> Retake this {isChapter ? 'Chapter Test' : 'Paper'}
              </Link>
              <Link
                to={isChapter ? "/chapter-tests" : "/paper-tests"}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Browse {isChapter ? 'more chapter tests' : 'more papers'} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

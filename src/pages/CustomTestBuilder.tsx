import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Atom, FlaskConical, Dna, Sigma, Minus, Plus, Clock, Shuffle, GraduationCap,
  Lock, Crown, ChevronRight, RotateCcw, Search, ListChecks, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useSubscriptionAccess } from '../lib/subscription';
import { getExam, type ExamType } from '../lib/exam';
import {
  NEET_CUSTOM_CHAPTERS, NEET_CUSTOM_SUBJECTS, type NeetSubject,
} from '../data/neetCustomChapters';
import {
  JEE_CUSTOM_CHAPTERS, type JeeSubject,
} from '../data/jeeCustomChapters';
import {
  loadNeetChapterMap, loadJeeChapterMap, poolByChapter, buildCustomTest,
  buildJeeCustomTest, saveCustomTest, MAX_CUSTOM_QUESTIONS, getCustomTestQuota,
} from '../lib/customTest';

type BuilderSubject = NeetSubject | JeeSubject;

const JEE_CUSTOM_SUBJECTS: JeeSubject[] = ['Physics', 'Chemistry', 'Mathematics'];

const SUBJECT_ICONS: Record<BuilderSubject, typeof Atom> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  Mathematics: Sigma,
};

const SUBJECT_STYLES: Record<BuilderSubject, string> = {
  Physics: 'bg-indigo-100 text-indigo-700',
  Chemistry: 'bg-amber-100 text-amber-700',
  Biology: 'bg-emerald-100 text-emerald-700',
  Mathematics: 'bg-sky-100 text-sky-700',
};

const DURATION_CHIPS = [30, 45, 60, 90, 120, 180];

export default function CustomTestBuilder() {
  const { user } = useAuth();
  const { hasAccess, loading: accessLoading } = useSubscriptionAccess();
  const navigate = useNavigate();
  const userId = user?.id ?? '';

  const [pool, setPool] = useState<Record<string, number[]>>({});
  const [poolLoading, setPoolLoading] = useState(true);
  const [exam, setExam] = useState<ExamType>(() => getExam());
  const [subject, setSubject] = useState<BuilderSubject | 'All'>('All');
  const [search, setSearch] = useState('');
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [minutes, setMinutes] = useState(60);

  const [quotaLoading, setQuotaLoading] = useState(true);
  const [hasFreeAttempt, setHasFreeAttempt] = useState(false);
  const [customAttemptsCount, setCustomAttemptsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setQuotaLoading(false);
      return;
    }
    setQuotaLoading(true);
    getCustomTestQuota(userId).then((res) => {
      if (!cancelled) {
        setHasFreeAttempt(res.hasFreeAttempt);
        setCustomAttemptsCount(res.customAttemptsCount);
        setQuotaLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isJee = exam === 'jee';
  const chapters = isJee ? JEE_CUSTOM_CHAPTERS : NEET_CUSTOM_CHAPTERS;
  const examSubjects: readonly BuilderSubject[] = isJee ? JEE_CUSTOM_SUBJECTS : NEET_CUSTOM_SUBJECTS;

  useEffect(() => {
    let cancelled = false;
    setPoolLoading(true);
    (isJee ? loadJeeChapterMap() : loadNeetChapterMap()).then((map) => {
      if (!cancelled) {
        setPool(poolByChapter(map));
        setPoolLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isJee]);

  const switchExam = (next: ExamType) => {
    if (next === exam) return;
    setExam(next);
    setPicks({});
    setSearch('');
    setSubject('All');
  };

  const totalPicked = useMemo(
    () => Object.values(picks).reduce((s, n) => s + n, 0),
    [picks]
  );

  // Default pace: ~1 minute per question. Follows the total upward but never
  // overrides a duration the student set by hand.
  useEffect(() => {
    setMinutes((m) => Math.max(m, Math.min(240, totalPicked || 0)));
  }, [totalPicked]);

  const poolSize = useMemo(
    () => Object.values(pool).reduce((s, ids) => s + ids.length, 0),
    [pool]
  );

  const visibleChapters = useMemo(() => {
    const q = search.trim().toLowerCase();
    return chapters.filter((c) => {
      if (subject !== 'All' && c.subject !== subject) return false;
      if (q && !c.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [chapters, subject, search]);

  const setPick = (chapterId: string, n: number) => {
    const available = pool[chapterId]?.length ?? 0;
    const clamped = Math.max(0, Math.min(available, Math.floor(n)));
    setPicks((prev) => {
      if (clamped <= 0) {
        const { [chapterId]: _dropped, ...rest } = prev;
        return rest;
      }
      const nextTotal =
        Object.entries(prev).reduce((s, [k, v]) => s + (k === chapterId ? 0 : v), 0) + clamped;
      if (nextTotal > MAX_CUSTOM_QUESTIONS) return prev;
      return { ...prev, [chapterId]: clamped };
    });
  };

  const handleGenerate = () => {
    const def = isJee
      ? buildJeeCustomTest(picks, pool, minutes)
      : buildCustomTest(picks, pool, minutes);
    if (!def) return;
    saveCustomTest(userId, def);
    navigate(`/test?custom=${def.id}`);
  };

  const canAccessBuilder = hasAccess || hasFreeAttempt;
  const isFreeTrial = !hasAccess && hasFreeAttempt;

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Claim your 1 Free Custom Test</h2>
          <p className="text-sm text-stone-500 mb-6 leading-relaxed">
            Sign in to pick any combination of chapters, customize question count and timer, and test yourself with full NTA-style scoring.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/login?next=/custom-test')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign In to Continue
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!accessLoading && !quotaLoading && !canAccessBuilder) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">You've used your free custom test!</h2>
          <p className="text-sm text-stone-500 mb-6 leading-relaxed">
            You have already completed {customAttemptsCount > 1 ? `${customAttemptsCount} custom tests` : 'your 1 free custom test'}. Subscribe to Pro to unlock unlimited custom tests from any chapter, targeted weakness practice, and complete analytics.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro for Unlimited Tests
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              View Your Test Results on Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canGenerate = totalPicked >= 5 && !poolLoading;

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Free trial banner */}
        {isFreeTrial && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md shadow-violet-600/10 mb-8 animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="font-bold text-sm text-white flex items-center gap-1.5">
                  1 Free Custom Test Available
                  <span className="text-[10px] bg-amber-400 text-stone-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Free Trial</span>
                </p>
                <p className="text-xs text-violet-100">
                  Select your chapters, choose your duration and question count, and experience full NTA-style testing & chapter-wise analytics.
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold bg-white text-violet-700 hover:bg-violet-50 px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0"
            >
              <Crown className="w-3.5 h-3.5" /> Unlock Unlimited Tests
            </Link>
          </div>
        )}
        {/* Exam picker */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-stone-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => switchExam('neet')}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isJee ? 'bg-emerald-600 text-white shadow' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              NEET
            </button>
            <button
              onClick={() => switchExam('jee')}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isJee ? 'bg-indigo-600 text-white shadow' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              JEE Main
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 px-4 py-1.5 rounded-full text-sm text-stone-500 mb-3 shadow-sm">
            <Shuffle className="w-3.5 h-3.5 text-violet-500" />
            {poolLoading ? 'Loading question pool…' : `${poolSize} audited ${isJee ? 'JEE' : 'NEET'} questions in the pool`}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight font-display">
            Build a Custom Test
          </h1>
          <p className="text-stone-500 mt-2 max-w-lg mx-auto text-sm sm:text-base">
            Pick chapters and question counts — each subject stays its own
            block, shuffled within, so you never know which chapter a question
            came from.{' '}
            {!isJee && (
              <>
                Chapters tagged{' '}
                <span className="text-[11px] font-bold uppercase tracking-wide text-red-700 bg-red-100 border border-red-200 px-1.5 py-px rounded whitespace-nowrap">
                  Out of syllabus
                </span>{' '}
                were dropped from the new NEET syllabus but still have real
                past-paper questions — attempt them only if you want to.
              </>
            )}
          </p>
        </div>

        {/* Subject tabs + search */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search chapters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 placeholder:text-stone-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {(['All', ...examSubjects] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    subject === s
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {s !== 'All' && (() => {
                    const Icon = SUBJECT_ICONS[s];
                    return <Icon className="w-3.5 h-3.5 opacity-80" />;
                  })()}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chapter pickers */}
        {([...examSubjects] as BuilderSubject[])
          .filter((s) => subject === 'All' || subject === s)
          .map((sub) => {
            const rows = visibleChapters.filter((c) => c.subject === sub);
            if (rows.length === 0) return null;
            const Icon = SUBJECT_ICONS[sub];
            const subPicked = rows.reduce((s, c) => s + (picks[c.id] ?? 0), 0);
            return (
              <div key={sub} className="mb-8">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${SUBJECT_STYLES[sub]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-800">{sub}</h2>
                    {subPicked > 0 && (
                      <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200/60 px-2 py-0.5 rounded-full">
                        {subPicked} picked
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rows.map((c) => {
                    const available = pool[c.id]?.length ?? 0;
                    const picked = picks[c.id] ?? 0;
                    const empty = available === 0;
                    return (
                      <div
                        key={c.id}
                        className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 transition-colors ${
                          picked > 0 ? 'border-violet-300 shadow-sm' : 'border-stone-200'
                        } ${empty ? 'opacity-60' : ''}`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-stone-800 leading-snug">{c.title}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {('outOfSyllabus' in c && c.outOfSyllabus) && (
                              <span className="text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-100 border border-red-200 px-1.5 py-px rounded">
                                Out of syllabus
                              </span>
                            )}
                            <span className="text-xs text-stone-400">
                              {poolLoading ? '…' : empty ? 'Audit in progress — unlocks soon' : `${available} in pool`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setPick(c.id, picked - 1)}
                            disabled={empty || picked <= 0}
                            aria-label={`Fewer ${c.title} questions`}
                            className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={`w-8 text-center text-sm font-bold font-mono ${picked > 0 ? 'text-violet-700' : 'text-stone-400'}`}>
                            {picked}
                          </span>
                          <button
                            onClick={() => setPick(c.id, picked + 1)}
                            disabled={empty || picked >= available || totalPicked >= MAX_CUSTOM_QUESTIONS}
                            aria-label={`More ${c.title} questions`}
                            className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {visibleChapters.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 mb-8">
            <h3 className="text-base font-medium text-stone-700 mb-1">No chapters found</h3>
            <p className="text-sm text-stone-400">Try a different search or subject tab.</p>
          </div>
        )}

        {/* Summary + duration + generate (sticky) */}
        <div className="sticky bottom-4 bg-white rounded-2xl border border-stone-200 shadow-xl p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-800">
                  {totalPicked} question{totalPicked === 1 ? '' : 's'} selected
                </div>
                <div className="text-xs text-stone-400">
                  min 5 · max {MAX_CUSTOM_QUESTIONS} · mixed within each subject
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:ml-auto">
              <Clock className="w-4 h-4 text-stone-400 shrink-0" />
              <div className="flex gap-1.5 flex-wrap">
                {DURATION_CHIPS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setMinutes(d)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      minutes === d ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                    {d >= 60 ? `${d / 60}h` : `${d}m`}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-stone-100 rounded-lg px-2.5 py-1.5">
                <input
                  type="number"
                  min={5}
                  max={240}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(5, Math.min(240, Number(e.target.value) || 0)))}
                  className="w-14 bg-transparent text-sm font-bold text-stone-800 focus:outline-none text-center"
                  aria-label="Custom duration in minutes"
                />
                <span className="text-xs text-stone-400 font-medium">min</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPicks({})}
                disabled={totalPicked === 0}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 disabled:opacity-40 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-600/25"
              >
                <Shuffle className="w-4 h-4" />
                {totalPicked < 5 ? `Pick ${5 - totalPicked} more` : `Start Test · ${minutes} min`}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors"
          >
            Back to Dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

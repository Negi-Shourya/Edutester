import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, BarChart2, RefreshCw, LayoutDashboard, Target, ArrowRight, BookOpen } from 'lucide-react';
import type { Question, QuestionState } from '../types';
import type { AttemptResult } from '../lib/scoring';
import type { QuestionKey } from '../lib/attemptsDb';
import { chapterInfo, paperTestChapters, type ChapterPerformance } from '../lib/chapterAnalysis';
import { loadChapterIndex } from '../lib/questionChapterMap';
import { examOfPaperKey } from '../lib/exam';
import QuestionDiagram from './QuestionDiagram';
import VectorText from './VectorText';
import ScoreRing from './ScoreRing';

// Solutions are shown in pages of this many questions; the next page loads
// via the Load More button / progress bar, so the DOM stays small and the
// screen scrolls smoothly no matter how large the paper is.
const PAGE_SIZE = 10;

interface NtaResultScreenProps {
  questions: Question[];
  questionStates: QuestionState[];
  sections: string[];
  examTitle: string;
  onRetake: () => void;
  // Server-computed result from the score-attempt edge function.
  result: AttemptResult;
  // Answer keys + solutions for this paper only, returned with the result.
  keys: Record<string, QuestionKey>;
  // Identifies the test for chapter-aware analysis links. For chapter tests
  // paperKey is the chapter id (e.g. "jee-phy-1").
  paperKey?: string;
  isChapter?: boolean;
}

interface SolutionCardProps {
  q: Question;
  qState: QuestionState | undefined;
  keyInfo: QuestionKey | undefined;
  outcome: 'correct' | 'incorrect' | 'unattempted' | undefined;
}

// One question's full solution block — question, options, answer summary and
// explanation, always shown (no expand/collapse). Memoized so re-renders of
// the parent don't touch cards whose props are unchanged.
const SolutionCard = memo(function SolutionCard({ q, qState, keyInfo, outcome }: SolutionCardProps) {
  const isMCQ = q.type === 'mcq' || !q.type;
  const userAns = isMCQ ? qState?.selectedOption || '' : qState?.numericAnswer?.trim() || '';
  const isCorrect = outcome === 'correct';
  const isUnattempted = outcome === 'unattempted';

  return (
    <div
      className={`border rounded overflow-hidden shadow-xs ${
        isCorrect
          ? 'border-green-300 bg-green-50/20'
          : isUnattempted
          ? 'border-gray-200 bg-gray-50/50'
          : 'border-red-300 bg-red-50/20'
      }`}
    >
      {/* Question Result Bar */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1b365d] text-xs">
            Q.{q.number} ({q.section})
          </span>
          {isCorrect ? (
            <span className="bg-green-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
              CORRECT (+{q.marks ?? 4})
            </span>
          ) : isUnattempted ? (
            <span className="bg-gray-500 text-white font-bold text-[10px] px-2 py-0.5 rounded">
              UNATTEMPTED (0)
            </span>
          ) : (
            <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
              INCORRECT ({q.negativeMarks ?? -1})
            </span>
          )}
        </div>
      </div>

      {/* Solution Content */}
      <div className="p-4 bg-white text-xs space-y-3">
        <p className="font-semibold text-gray-900 leading-relaxed text-sm">
          <VectorText text={q.text} />
        </p>

        <QuestionDiagram figureUrl={q.figureUrl} />

        {/* Options */}
        {isMCQ && q.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
            {q.options.map((opt) => {
              const isUserChoice = userAns === opt.label;
              const isCorrectChoice = keyInfo?.correctAnswer === opt.label;
              let style = 'bg-gray-50 border-gray-200 text-gray-700';

              if (isCorrectChoice) {
                style = 'bg-green-100 border-green-400 text-green-900 font-bold';
              } else if (isUserChoice && !isCorrectChoice) {
                style = 'bg-red-100 border-red-400 text-red-900 font-bold';
              }

              return (
                <div key={opt.label} className={`p-2 border rounded text-xs flex items-center justify-between ${style}`}>
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <strong className="mr-1">({opt.label})</strong>
                    {opt.figureUrl && (
                      <img
                        src={opt.figureUrl}
                        alt={`Option ${opt.label}`}
                        className="max-h-64 max-w-full h-auto object-contain rounded-sm"
                      />
                    )}
                    {opt.text && <VectorText text={opt.text} />}
                  </span>
                  {isCorrectChoice && <span className="text-green-700 text-[10px] font-bold">✓ Correct Answer</span>}
                  {isUserChoice && !isCorrectChoice && <span className="text-red-700 text-[10px] font-bold">✗ Your Answer</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Answer Summary */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2.5 rounded border border-gray-200 text-xs">
          <div>Your Answer: <strong className={isCorrect ? 'text-green-700' : isUnattempted ? 'text-gray-500' : 'text-red-600'}>{userAns || 'None'}</strong></div>
          <div>Correct Answer: <strong className="text-green-700">{keyInfo?.correctAnswer ?? '—'}</strong></div>
        </div>

        {/* Step-by-step explanation (from question_keys.solution) */}
        {keyInfo?.solution && (
          <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded p-3">
            <div className="text-[11px] font-bold text-[#1b365d] uppercase tracking-wide mb-1.5">
              Explanation
            </div>
            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              <VectorText text={keyInfo.solution} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

type StatusFilter = 'ALL' | 'attempted' | 'unattempted';

// Post-submit analysis: a donut ring of the outcome split (correct /
// incorrect / unattempted) with the score share in the middle, per-section
// mini rings, and a weakest-area callout that points at the next practice
// step. Everything here feeds the dashboard — the same attempt row powers
// the weak-subject → weak-chapter drill-down there.
function PerformanceAnalysis({
  result,
  sectionResults,
  paperKey,
  isChapter,
}: {
  result: AttemptResult;
  sectionResults: Array<{
    section: string;
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    score: number;
    maxScore: number;
  }>;
  paperKey?: string;
  isChapter: boolean;
}) {
  const scorePct =
    result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0;
  const attempted = sectionResults.filter((s) => s.total > 0);
  const byAcc = (s: (typeof attempted)[number]) =>
    s.correct + s.incorrect > 0 ? s.correct / (s.correct + s.incorrect) : 1;
  const sorted = [...attempted].sort((a, b) => byAcc(a) - byAcc(b));
  const weakest = sorted.length > 0 ? sorted[0] : null;
  const strongest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const weakestAcc =
    weakest && weakest.correct + weakest.incorrect > 0
      ? Math.round((weakest.correct / (weakest.correct + weakest.incorrect)) * 100)
      : null;
  const needsWork = weakestAcc !== null && weakestAcc < 60;

  const chapter = isChapter && paperKey ? chapterInfo(paperKey) : null;

  // Full papers: attribute each question to its chapter via the
  // question→chapter index (chapter tests were carved out of papers, so the
  // ids match). Loaded lazily here in the post-submit analysis — never
  // during the test, so the chapter stays hidden while attempting.
  const [paperChapters, setPaperChapters] = useState<ChapterPerformance[] | null>(null);
  useEffect(() => {
    if (isChapter || !paperKey) {
      setPaperChapters(null);
      return;
    }
    let cancelled = false;
    setPaperChapters(null);
    loadChapterIndex().then((index) => {
      if (cancelled) return;
      setPaperChapters(
        paperTestChapters(result.questionOutcomes ?? {}, examOfPaperKey(paperKey), index)
      );
    });
    return () => {
      cancelled = true;
    };
  }, [isChapter, paperKey, result]);

  const weakPaperChapters = useMemo(
    () => (paperChapters ?? []).filter((c) => c.isWeak).slice(0, 3),
    [paperChapters]
  );
  const mappedQuestions = useMemo(
    () => (paperChapters ?? []).reduce((s, c) => s + c.questions, 0),
    [paperChapters]
  );
  const totalQuestions =
    result.totalCorrect + result.totalIncorrect + result.totalUnattempted;

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
      <div className="bg-[#1b365d] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide flex items-center gap-2">
        <Target className="w-4 h-4 text-amber-300" />
        Performance Analysis
      </div>
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
        <ScoreRing
          percent={scorePct}
          centerLabel="score"
          segments={[
            { value: result.totalCorrect, color: '#16a34a', label: 'Correct' },
            { value: result.totalIncorrect, color: '#dc2626', label: 'Incorrect' },
            {
              value: result.totalUnattempted,
              color: '#d1d5db',
              label: 'Unattempted',
            },
          ]}
        />
        <div className="min-w-0">
          {/* Per-section mini rings */}
          <div className="flex flex-wrap gap-4 mb-4">
            {sectionResults.map((sec) => {
              const secTotal = sec.correct + sec.incorrect + sec.unattempted;
              const secPct =
                sec.maxScore > 0 ? Math.round((sec.score / sec.maxScore) * 100) : 0;
              return (
                <div key={sec.section} className="flex items-center gap-2.5">
                  <ScoreRing
                    percent={secPct}
                    segments={[
                      { value: sec.correct, color: '#16a34a', label: 'Correct' },
                      { value: sec.incorrect, color: '#dc2626', label: 'Incorrect' },
                      { value: sec.unattempted, color: '#d1d5db', label: 'Unattempted' },
                    ]}
                    size={64}
                    stroke={9}
                    legend={false}
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900">{sec.section}</div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      {sec.score}/{sec.maxScore} · {secTotal > 0 ? `${sec.correct}/${secTotal} correct` : 'no questions'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Weakest-area callout */}
          {weakest && weakestAcc !== null && (
            <div
              className={`border rounded-lg px-3.5 py-3 text-xs leading-relaxed ${
                needsWork ? 'bg-red-50 border-red-200 text-red-900' : 'bg-green-50 border-green-200 text-green-900'
              }`}
            >
              {needsWork ? (
                <>
                  <strong>Weak spot: {weakest.section}</strong> — {weakestAcc}% accuracy
                  ({weakest.correct} correct, {weakest.incorrect} wrong
                  {weakest.unattempted > 0 ? `, ${weakest.unattempted} skipped` : ''}).
                  {chapter ? (
                    <>
                      {' '}Revise <strong>{chapter.title}</strong> and retake this chapter test to close the gap.
                    </>
                  ) : (
                    <>
                      {' '}The weak chapters behind it are broken down below with practice links.
                    </>
                  )}
                </>
              ) : (
                <>
                  <strong>Balanced performance</strong> — no section below 60% accuracy
                  {strongest ? <> (best: {strongest.section})</> : null}. Keep the streak going.
                </>
              )}
            </div>
          )}
          {/* Weak chapters inside this paper (full papers only) */}
          {!isChapter && paperChapters && paperChapters.length > 0 && (
            <div className="mt-3 border border-gray-200 rounded-lg p-3.5 bg-gray-50/60">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-gray-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#1b365d]" />
                Weak chapters in this paper
              </h4>
              <p className="text-[10px] text-gray-400 mb-2.5">
                Chapter mapped for {mappedQuestions} of {totalQuestions} questions — coverage grows as more chapters are added.
              </p>
              {weakPaperChapters.length === 0 ? (
                <p className="text-xs text-green-800 font-medium">
                  No weak chapter stood out — every mapped chapter is at 60%+ accuracy.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {weakPaperChapters.map((ch) => (
                    <div key={ch.chapterId}>
                      <div className="flex items-center justify-between gap-2 text-xs mb-1">
                        <span className="font-semibold text-gray-900">
                          {ch.title}
                          <span className="ml-1.5 font-normal text-gray-400">· {ch.subject}</span>
                        </span>
                        <span className="font-mono font-bold text-red-600">{ch.avgAccuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div
                          className="h-1.5 rounded-full bg-red-500"
                          style={{ width: `${ch.avgAccuracy}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span>
                          {ch.totalCorrect} right · {ch.totalIncorrect} wrong
                          {ch.totalUnattempted > 0 ? ` · ${ch.totalUnattempted} skipped` : ''} ({ch.questions} questions)
                        </span>
                        <Link
                          to={ch.hasTest ? `/test?chapter=${ch.chapterId}` : '/chapter-tests'}
                          className="inline-flex items-center gap-0.5 font-bold text-[#1b365d] hover:underline"
                        >
                          {ch.hasTest ? 'Practice chapter' : 'Browse chapter tests'} <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {isChapter && paperKey ? (
              <Link
                to={`/test?chapter=${paperKey}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#1b365d] hover:bg-[#152a4a] px-3 py-1.5 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Retake this chapter
              </Link>
            ) : (
              <Link
                to="/chapter-tests"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#1b365d] hover:bg-[#152a4a] px-3 py-1.5 rounded transition-colors"
              >
                Practice weak chapters <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#1b365d] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded transition-colors"
            >
              <LayoutDashboard className="w-3 h-3" /> Full analysis on dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'unattempted', label: 'Unattempted' },
];

export default function NtaResultScreen({
  questions,
  questionStates,
  sections,
  examTitle,
  onRetake,
  result,
  keys,
  paperKey,
  isChapter = false,
}: NtaResultScreenProps) {
  const navigate = useNavigate();
  const [activeFilterSection, setActiveFilterSection] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  // How many solution cards are currently shown; grows by PAGE_SIZE via the
  // Load More button. Resets whenever a filter changes.
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilterSection, statusFilter]);

  // O(1) lookup of a question's state instead of a per-question find() scan.
  const qStateById = useMemo(() => new Map(questionStates.map((qs) => [qs.id, qs])), [questionStates]);

  // Evaluation statistics come from the server-side scoring.
  const totalCorrect = result.totalCorrect;
  const totalIncorrect = result.totalIncorrect;
  const totalScore = result.totalScore;
  const maxPossibleScore = result.maxScore;
  const accuracy = result.accuracy;

  const sectionResults = useMemo(
    () =>
      sections.map((sec) => {
        const breakdown = result.sectionBreakdown.find((s) => s.section === sec);
        const secQuestions = questions.filter((q) => q.section === sec);
        return {
          section: sec,
          total: secQuestions.length,
          correct: breakdown?.correct ?? 0,
          incorrect: breakdown?.incorrect ?? 0,
          unattempted: breakdown?.unattempted ?? 0,
          score: breakdown?.score ?? 0,
          maxScore: breakdown?.maxScore ?? secQuestions.reduce((sum, q) => sum + (q.marks ?? 4), 0),
        };
      }),
    [sections, result.sectionBreakdown, questions]
  );

  // Questions in the selected subject (or all subjects).
  const subjectQuestions = useMemo(
    () => (activeFilterSection === 'ALL' ? questions : questions.filter((q) => q.section === activeFilterSection)),
    [activeFilterSection, questions]
  );

  // Status filter counts, scoped to the currently selected subject.
  const statusCounts = useMemo(() => {
    let attempted = 0;
    let unattempted = 0;
    for (const q of subjectQuestions) {
      if ((result.questionOutcomes[String(q.id)] ?? 'unattempted') === 'unattempted') unattempted++;
      else attempted++;
    }
    return { total: subjectQuestions.length, attempted, unattempted };
  }, [subjectQuestions, result.questionOutcomes]);

  const filteredQuestions = useMemo(() => {
    if (statusFilter === 'ALL') return subjectQuestions;
    const isUnattempted = (q: Question) => (result.questionOutcomes[String(q.id)] ?? 'unattempted') === 'unattempted';
    if (statusFilter === 'attempted') return subjectQuestions.filter((q) => !isUnattempted(q));
    return subjectQuestions.filter(isUnattempted);
  }, [subjectQuestions, statusFilter, result.questionOutcomes]);

  const visibleQuestions = useMemo(() => filteredQuestions.slice(0, visibleCount), [filteredQuestions, visibleCount]);
  const totalQuestions = filteredQuestions.length;
  const allLoaded = visibleCount >= totalQuestions;
  const progressPct = totalQuestions > 0 ? Math.round((visibleQuestions.length / totalQuestions) * 100) : 0;

  // Infinite scroll: a sentinel element below the last card triggers the
  // next page of PAGE_SIZE questions as soon as the user reaches it, so only
  // ~10 cards exist in the DOM at a time no matter how large the paper is.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const allLoadedRef = useRef(allLoaded);
  allLoadedRef.current = allLoaded;
  const totalQuestionsRef = useRef(totalQuestions);
  totalQuestionsRef.current = totalQuestions;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || allLoadedRef.current) return;
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, totalQuestionsRef.current));
      },
      // Trigger slightly before the sentinel scrolls fully into view, so the
      // next page is already there by the time the user finishes the 10th.
      { rootMargin: '160px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [allLoaded]);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 flex flex-col select-none">
      {/* Header */}
      <header className="bg-[#1b365d] text-white px-4 sm:px-6 py-3 sm:py-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-[#1b365d] text-xs font-black px-2 py-0.5 rounded shrink-0">NTA</span>
            <h1 className="text-sm sm:text-lg font-bold text-amber-300 truncate">Exam Results &amp; Answer Key</h1>
          </div>
          <p className="text-[10px] sm:text-xs text-blue-200 mt-0.5 truncate">{examTitle} &bull; Official NTA Format Scorecard</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 bg-[#337ab7] hover:bg-[#286090] text-white px-3 sm:px-4 py-2 rounded text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 bg-[#28a745] hover:bg-[#218838] text-white px-3 sm:px-4 py-2 rounded text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-6 flex-1">
        {/* Scorecard Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Score */}
          <div className="bg-white border-t-4 border-[#1b365d] rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Score</div>
              <div className="text-2xl font-black text-[#1b365d] mt-1">
                {totalScore} <span className="text-xs font-normal text-gray-400">/ {maxPossibleScore}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1b365d] flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-white border-t-4 border-amber-500 rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accuracy Rate</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{accuracy}%</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
          </div>

          {/* Correct Count */}
          <div className="bg-white border-t-4 border-green-600 rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correct Answers</div>
              <div className="text-2xl font-black text-green-700 mt-1">{totalCorrect}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Incorrect Count */}
          <div className="bg-white border-t-4 border-red-500 rounded shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Incorrect Answers</div>
              <div className="text-2xl font-black text-red-600 mt-1">{totalIncorrect}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Performance Analysis — outcome ring + weakest-area callout */}
        <PerformanceAnalysis
          result={result}
          sectionResults={sectionResults}
          paperKey={paperKey}
          isChapter={isChapter}
        />

        {/* Section Score Breakdown */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="bg-[#1b365d] text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wide">
            Subject-wise Performance Breakdown
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {sectionResults.map((sec) => (
              <div key={sec.section} className="bg-gray-50 border border-gray-200 rounded p-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                  <h3 className="font-bold text-[#1b365d] text-sm">{sec.section}</h3>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Score: {sec.score} / {sec.maxScore}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-gray-600">Correct:</span> <span className="font-bold text-green-700">+{sec.correct}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Incorrect:</span> <span className="font-bold text-red-600">-{sec.incorrect}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Unattempted:</span> <span className="font-semibold text-gray-500">{sec.unattempted}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question-wise Answer Key Section */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="bg-[#337ab7] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-sm uppercase tracking-wide">Question-wise Answer Key</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-normal text-blue-100">Filter Subject:</span>
              <select
                value={activeFilterSection}
                onChange={(e) => setActiveFilterSection(e.target.value)}
                className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded outline-none border border-blue-400"
              >
                <option value="ALL">All Subjects</option>
                {sections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status filter — separate, clearly visible buttons */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 mr-1">Status:</span>
            {STATUS_FILTERS.map(({ value, label }) => {
              const count =
                value === 'ALL' ? statusCounts.total : value === 'attempted' ? statusCounts.attempted : statusCounts.unattempted;
              const isActive = statusFilter === value;
              return (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1b365d] text-white border-[#1b365d]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#337ab7] hover:text-[#337ab7]'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          <div className="p-4 space-y-4">
            {visibleQuestions.length === 0 ? (
              <div className="text-center text-xs font-semibold text-gray-500 py-6">
                No questions match the selected filters.
              </div>
            ) : (
              visibleQuestions.map((q) => (
                <SolutionCard
                  key={q.id}
                  q={q}
                  qState={qStateById.get(q.id)}
                  keyInfo={keys[String(q.id)]}
                  outcome={result.questionOutcomes[String(q.id)]}
                />
              ))
            )}

            {/* Sentinel — fires the infinite scroll load of the next page */}
            {!allLoaded && visibleQuestions.length > 0 && (
              <div ref={sentinelRef} aria-hidden="true" className="h-1" />
            )}

            {/* Progress — fills as pages load */}
            <div className="pt-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#337ab7] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-600">
                  Showing {visibleQuestions.length} of {totalQuestions} questions
                </span>
                {allLoaded && totalQuestions > PAGE_SIZE && (
                  <span className="text-xs font-semibold text-gray-500">
                    All {totalQuestions} questions displayed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

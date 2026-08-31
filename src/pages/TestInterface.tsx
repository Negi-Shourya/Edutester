import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPaperQuestions, getChapterQuestions, type PaperQuestions } from '../data/questions';
import type { Question, QuestionState, QuestionStatus } from '../types';
import { DEFAULT_PAPER_KEY, useSubscriptionAccess } from '../lib/subscription';
import { loadAttempt, saveAttempt, clearAttempt } from '../lib/attemptStorage';
import { submitAttempt, type SubmitAttemptPayload } from '../lib/attemptsDb';
import { supabase } from '../lib/supabase';
import { examOfPaperKey } from '../lib/exam';
import { useAuth } from '../context/auth-context';
import { Crown, Lock, LayoutDashboard, RotateCcw, X } from 'lucide-react';

import NtaHeader from '../components/NtaHeader';
import NtaQuestionPanel from '../components/NtaQuestionPanel';
import NtaQuestionPalette from '../components/NtaQuestionPalette';
import NtaQuestionPaperModal from '../components/NtaQuestionPaperModal';
import NtaInstructionsModal from '../components/NtaInstructionsModal';
import NtaSubmitModal from '../components/NtaSubmitModal';
import NtaResultScreen from '../components/NtaResultScreen';

const EMPTY_QUESTIONS: Question[] = [];

// How long before the clock runs out to warm the scoring function.
const WARM_LEAD_SECONDS = 120;

export default function TestInterface() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const chapterParam = searchParams.get('chapter');
  const paperParam = searchParams.get('paper');
  const isChapter = Boolean(chapterParam);
  const paperKey = chapterParam || paperParam || DEFAULT_PAPER_KEY;
  const testType: 'paper' | 'chapter' = isChapter ? 'chapter' : 'paper';

  const { user } = useAuth();
  // Saved attempts are stored per account, so every read and write is scoped to
  // this id. Empty while auth resolves: attemptStorage treats that as "no owner
  // known" and neither reads nor writes, and the effects below re-run once the
  // id arrives.
  const userId = user?.id ?? '';
  const { hasAccess, loading: accessLoading } = useSubscriptionAccess();

  const candidateName = (
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    'CANDIDATE'
  ).toUpperCase();
  const candidateId = '123456';

  const [paperData, setPaperData] = useState<PaperQuestions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Test state
  const [activeSection, setActiveSection] = useState<string>('Physics');
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>('English');
  const [isTestSubmitted, setIsTestSubmitted] = useState<boolean>(false);
  // False until the user reads the instructions, ticks the consent checkbox
  // and clicks Start — the timer only runs and the attempt only saves once
  // the test has actually started. A resumed saved attempt starts directly.
  const [testStarted, setTestStarted] = useState<boolean>(false);
  // True once this submitted attempt has been pushed to the DB (see the
  // sync effect below). Persisted so a refresh doesn't create a duplicate row.
  const [syncedToDb, setSyncedToDb] = useState<boolean>(false);
  // Server-computed result (score + solutions) from the score-attempt edge
  // function. Persisted so a refresh after submission re-renders the result
  // screen without another network call.
  const [resultPayload, setResultPayload] = useState<SubmitAttemptPayload | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Bumped when the user taps Retry on the scoring-error screen; the submit
  // effect depends on it so a retry re-runs the call.
  const [submitRetry, setSubmitRetry] = useState<number>(0);

  // Modals state
  const [showQuestionPaper, setShowQuestionPaper] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Short-lived Toast Popup state (shows for 2.5 seconds then vanishes)
  const [showExitHintToast, setShowExitHintToast] = useState<boolean>(true);

  // Mobile UX: whether the question palette drawer is open, and whether the
  // user has dismissed the rotate-suggestion banner.
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);

  // Track orientation/ephemeral "is this a phone?" via matchMedia. On phones
  // the palette hides from the layout and opens as a drawer instead — but in
  // landscape there is usually enough width, so we keep the inline palette.
  // Track "is this a phone?" + orientation. Width alone is unreliable in
  // landscape (a phone in landscape can easily exceed 767px CSS width, e.g.
  // Redmi Turbo 5), so we also detect coarse pointers (touchscreens) and use
  // the actual viewport height/width ratio for orientation.
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    return (
      window.matchMedia('(max-width: 767px)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    );
  });
  const [isPortrait, setIsPortrait] = useState<boolean>(
    () => window.innerHeight > window.innerWidth
  );
  // Phone landscape (short viewport, e.g. a rotated phone): the palette
  // becomes a slide-in drawer so the question pane keeps full width.
  const [isShortLandscape, setIsShortLandscape] = useState<boolean>(
    () => window.innerWidth > window.innerHeight && window.innerHeight <= 500
  );
  // The rotate hint should only ever appear once per paper, even across
  // refreshes — remember the dismissal for this specific paper key.
  const [dismissedRotateHint, setDismissedRotateHint] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(`rotate-hint-dismissed-${paperKey}`) === '1';
    } catch {
      return false;
    }
  });
  // Landscape (phone or desktop) always shows the palette inline so the user
  // can navigate questions and see answered/not-answered status at a glance.
  // Only portrait phones hide it behind a button-triggered drawer. A phone in
  // short landscape (height ≤ 500px) also gets the drawer — the inline sidebar
  // eats too much horizontal width and makes question text unreadable.
  const paletteAsDrawer = isCompact && (isPortrait || isShortLandscape);
  const paletteInline = !paletteAsDrawer;
  const compactLandscape = isCompact && !isPortrait;

  useEffect(() => {
    const mqCompact = window.matchMedia('(max-width: 767px)');
    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const updateViewport = () => {
      setIsCompact(mqCompact.matches || mqCoarse.matches);
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsShortLandscape(window.innerWidth > window.innerHeight && window.innerHeight <= 500);
    };
    mqCompact.addEventListener('change', updateViewport);
    mqCoarse.addEventListener('change', updateViewport);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    return () => {
      mqCompact.removeEventListener('change', updateViewport);
      mqCoarse.removeEventListener('change', updateViewport);
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  // Timer: 3 Hours (180 minutes = 10800 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(180 * 60);

  const questions = paperData?.questions ?? EMPTY_QUESTIONS;
  // Exam-aware duration (JEE 3h, NEET 3h–3h20m) and section order, derived
  // from the loaded paper instead of hardcoded JEE assumptions.
  const durationSeconds = (paperData?.paper.durationMinutes ?? 180) * 60;
  const sections = useMemo(() => {
    const seen: string[] = [];
    for (const q of questions) {
      if (!seen.includes(q.section)) seen.push(q.section);
    }
    return seen;
  }, [questions]);
  // Set to true once an attempt has been restored from localStorage (or
  // freshly initialized), so the save effect never overwrites a saved
  // attempt with pre-hydration state.
  const hydratedRef = useRef(false);
  // Guards the one-time submission: set synchronously when the call starts so
  // a re-render (or StrictMode's double effect invocation) can't start a
  // second submit before resultPayload state flips.
  const submitRef = useRef(false);

  // Load the paper from the database when the paper key changes
  useEffect(() => {
    let cancelled = false;
    setPaperData(null);
    setQuestionStates([]);
    setCurrentQuestionId(null);
    setActiveSection('Physics');
    setTimeLeft(180 * 60);
    setIsTestSubmitted(false);
    setLoadError(null);
    setResultPayload(null);
    setSubmitError(null);
    setSubmitRetry(0);
    submitRef.current = false;

    const loadPromise = isChapter
      ? getChapterQuestions(paperKey)
      : getPaperQuestions(paperKey);

    loadPromise
      .then((data) => {
        if (!cancelled) {
          setPaperData(data);
          setTimeLeft((data.paper.durationMinutes ?? (isChapter ? 50 : 180)) * 60);
          if (data.questions.length > 0) {
            setActiveSection(data.questions[0].section);
          }
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load test.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paperKey, isChapter]);

  // Question States initialized to 'not-visited' (Question 1 is immediately marked 'not-answered')
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);

  // Re-initialize state once questions arrive (or paper changes). If a
  // saved attempt exists for this paper, resume it instead of starting fresh.
  useEffect(() => {
    if (questions.length === 0) return;

    const saved = loadAttempt(userId, paperKey);

    if (saved) {
      const validIds = new Set(questions.map((q) => q.id));
      const restoredStates = saved.questionStates.filter((qs) => validIds.has(qs.id));
      const states = questions.map((q) => {
        const existing = restoredStates.find((qs) => qs.id === q.id);
        return existing ?? { id: q.id, status: 'not-visited' as const };
      });
      setQuestionStates(states);
      setCurrentQuestionId(
        saved.currentQuestionId !== null && validIds.has(saved.currentQuestionId)
          ? saved.currentQuestionId
          : questions[0].id
      );
      setActiveSection(
        saved.activeSection && sections.includes(saved.activeSection)
          ? saved.activeSection
          : (questions[0]?.section ?? 'Physics')
      );
      setLanguage(saved.language === 'Hindi' ? 'Hindi' : 'English');
      setTimeLeft(saved.timeLeft > 0 ? saved.timeLeft : durationSeconds);
      setIsTestSubmitted(saved.isTestSubmitted);
      setSyncedToDb(!!saved.syncedToDb);
      setResultPayload(saved.resultPayload ?? null);
      setSubmitError(null);
      // A resumed attempt skips the instruction gate — the test was
      // already started before.
      setTestStarted(true);
    } else {
      setQuestionStates(
        questions.map((q, idx) => ({
          id: q.id,
          status: idx === 0 ? 'not-answered' : 'not-visited',
        }))
      );
      setCurrentQuestionId(questions[0].id);
      setActiveSection(questions[0]?.section ?? 'Physics');
      setLanguage('English');
      setTimeLeft(durationSeconds);
      setIsTestSubmitted(false);
      setSyncedToDb(false);
      setResultPayload(null);
      setSubmitError(null);
      // Fresh paper: wait for the user to read the instructions and
      // start the test explicitly.
      setTestStarted(false);
    }

    hydratedRef.current = true;
  }, [userId, paperKey, questions]);

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  // Persist the attempt locally when test state changes, and periodically
  // for the timer without re-serializing every single second.
  useEffect(() => {
    if (!hydratedRef.current || questions.length === 0) return;
    if (!testStarted) return;

    const flushSave = () => {
      saveAttempt(userId, paperKey, {
        currentQuestionId: currentQuestionId ?? questions[0]?.id ?? null,
        activeSection,
        language,
        timeLeft: timeLeftRef.current,
        questionStates,
        isTestSubmitted,
        syncedToDb,
        resultPayload,
      });
    };

    flushSave();

    // Periodic backup timer every 15 seconds
    const timer = setInterval(flushSave, 15000);

    // Save on tab switch or page close
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushSave();
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', flushSave);

    return () => {
      clearInterval(timer);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', flushSave);
    };
  }, [
    userId,
    paperKey,
    questions,
    testStarted,
    currentQuestionId,
    activeSection,
    language,
    questionStates,
    isTestSubmitted,
    syncedToDb,
    resultPayload,
  ]);

  // Warm the score-attempt edge function shortly before it is needed, so the
  // submission doesn't pay a cold-start penalty. This used to ping every two
  // minutes for the whole exam — ~90 invocations per student to protect one
  // call, which is most of a month's function quota once a few thousand
  // students sit a paper. Submission is only ever imminent on two edges: the
  // student opens the submit dialog, or the clock is nearly out. Warm on
  // those instead; failures are ignored (submission retries anyway).
  const submitImminent =
    testStarted && !isTestSubmitted && (showSubmitModal || timeLeft <= WARM_LEAD_SECONDS);

  useEffect(() => {
    if (!submitImminent) return;
    supabase.functions
      .invoke('score-attempt', { headers: { 'x-warmup': '1' }, body: {} })
      .catch(() => {});
  }, [submitImminent]);

  // When the test is submitted, the result comes from the score-attempt
  // edge function: it verifies access server-side, scores the attempt
  // against the private answer keys, records the attempt row and returns the
  // score + solutions for this paper. The payload is persisted with the
  // attempt (resultPayload above), so a refresh or re-render can't lose the
  // result or create a duplicate row. Failures surface on the result screen
  // with a Retry action; unsynced attempts are backfilled on the next
  // Dashboard visit.
  useEffect(() => {
    if (!hydratedRef.current || questions.length === 0) return;
    if (!isTestSubmitted || resultPayload) return;
    if (submitRef.current) return;
    submitRef.current = true;

    submitAttempt({
      paperKey,
      testType,
      title: paperData?.paper.fullTitle ?? paperKey,
      timeSpent: Math.max(0, durationSeconds - timeLeft),
      questionStates,
    }).then((res) => {
      if (res.ok && res.payload) {
        setResultPayload(res.payload);
        setSyncedToDb(true);
        setSubmitError(null);
      } else {
        setSubmitError(res.error ?? 'Could not score the attempt. Please retry.');
      }
    });
  }, [isTestSubmitted, resultPayload, submitRetry, paperKey, testType, questions, questionStates, paperData, timeLeft]);

  // Resolve the current question. If currentQuestionId is stale/null, prefer
  // the first question of the ACTIVE section so the panel never shows a
  // Physics question while the Chemistry tab is highlighted.
  const currentQuestion =
    questions.find((q) => q.id === currentQuestionId) ??
    questions.find((q) => q.section === activeSection) ??
    questions[0];
  const currentQuestionState = questionStates.find((qs) => qs.id === currentQuestion?.id);

  // Helper to force full screen mode
  const forceFullscreen = useCallback(() => {
    if (!document.fullscreenElement && !isTestSubmitted) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, [isTestSubmitted]);

  // Request Full-screen automatically on test mount
  useEffect(() => {
    forceFullscreen();
  }, [forceFullscreen]);

  // Pop-up Toast: Auto-disappears after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowExitHintToast(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Timer countdown — only runs once the test has started
  useEffect(() => {
    if (!testStarted || isTestSubmitted) return;
    if (timeLeft <= 0) {
      setIsTestSubmitted(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isTestSubmitted, testStarted]);

  // Helper to update state of a single question
  const updateQuestionState = useCallback(
    (id: number, updates: Partial<QuestionState>) => {
      setQuestionStates((prev) =>
        prev.map((qs) => (qs.id === id ? { ...qs, ...updates } : qs))
      );
    },
    []
  );

  // Navigate to a specific question ID
  const handleSelectQuestion = (id: number) => {
    const targetQ = questions.find((q) => q.id === id);
    if (!targetQ) return;

    if (targetQ.section !== activeSection) {
      setActiveSection(targetQ.section);
    }

    setCurrentQuestionId(id);

    // If question was 'not-visited', change it to 'not-answered'
    const targetState = questionStates.find((qs) => qs.id === id);
    if (targetState?.status === 'not-visited') {
      updateQuestionState(id, { status: 'not-answered' });
    }
  };

  // Switch section tab
  const handleSelectSection = (section: string) => {
    setActiveSection(section);
    const secQs = questions.filter((q) => q.section === section);
    if (secQs.length > 0) {
      handleSelectQuestion(secQs[0].id);
    }
  };

  // Answer selection handlers
  const handleSelectOption = (optionLabel: string) => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, { selectedOption: optionLabel });
  };

  const handleChangeNumericAnswer = (value: string) => {
    if (!currentQuestion) return;
    updateQuestionState(currentQuestion.id, { numericAnswer: value });
  };

  // Helper to move to next question sequentially
  const advanceToNextQuestion = () => {
    const allIds = questions.map((q) => q.id);
    const currentIndexInAll = allIds.indexOf(currentQuestion.id);
    if (currentIndexInAll < allIds.length - 1) {
      const nextId = allIds[currentIndexInAll + 1];
      handleSelectQuestion(nextId);
    }
  };

  // NTA Action Button Handlers
  const handleSaveNext = () => {
    const isMCQ = currentQuestion.type === 'mcq' || !currentQuestion.type;
    const hasAnswer = isMCQ
      ? !!currentQuestionState?.selectedOption
      : !!currentQuestionState?.numericAnswer?.trim();

    const newStatus: QuestionStatus = hasAnswer ? 'answered' : 'not-answered';

    updateQuestionState(currentQuestion.id, { status: newStatus });
    advanceToNextQuestion();
  };

  const handleClearResponse = () => {
    updateQuestionState(currentQuestion.id, {
      selectedOption: undefined,
      numericAnswer: undefined,
      status: 'not-answered',
    });
  };

  const handleSaveMarkReview = () => {
    const isMCQ = currentQuestion.type === 'mcq' || !currentQuestion.type;
    const hasAnswer = isMCQ
      ? !!currentQuestionState?.selectedOption
      : !!currentQuestionState?.numericAnswer?.trim();

    const newStatus: QuestionStatus = hasAnswer ? 'answered-marked' : 'marked';

    updateQuestionState(currentQuestion.id, { status: newStatus });
    advanceToNextQuestion();
  };

  const handleMarkReviewNext = () => {
    const isMCQ = currentQuestion.type === 'mcq' || !currentQuestion.type;
    const hasAnswer = isMCQ
      ? !!currentQuestionState?.selectedOption
      : !!currentQuestionState?.numericAnswer?.trim();

    const newStatus: QuestionStatus = hasAnswer ? 'answered-marked' : 'marked';

    updateQuestionState(currentQuestion.id, { status: newStatus });
    advanceToNextQuestion();
  };

  const handleNavigate = (direction: number) => {
    const allIds = questions.map((q) => q.id);
    const currentIndexInAll = allIds.indexOf(currentQuestion.id);
    const nextIdx = currentIndexInAll + direction;
    if (nextIdx >= 0 && nextIdx < allIds.length) {
      handleSelectQuestion(allIds[nextIdx]);
    }
  };

  const handleRetakeTest = () => {
    clearAttempt(userId, paperKey);
    setSyncedToDb(false);
    setResultPayload(null);
    setSubmitError(null);
    setSubmitRetry(0);
    submitRef.current = false;
    setQuestionStates(
      questions.map((q, idx) => ({
        id: q.id,
        status: idx === 0 ? 'not-answered' : 'not-visited',
      }))
    );
    setTimeLeft(durationSeconds);
    setIsTestSubmitted(false);
    setTestStarted(false);
    setCurrentQuestionId(questions[0]?.id ?? null);
    setActiveSection('Physics');
  };

  if (accessLoading) {
    return (
      <div className="h-screen h-[100dvh] w-screen bg-[#091526] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-200 text-sm font-medium">Checking accessâ€¦</p>
      </div>
    );
  }

  // Gate on the paper's own `is_trial` flag — the same rule score-attempt
  // enforces server-side. This used to compare against a single hardcoded JEE
  // key, so any other trial paper (all the flagged NEET ones) was advertised as
  // free on the list page and then locked here.
  //
  // Waits for the paper to load: until then `is_trial` is unknown, and
  // defaulting either way is wrong — false flashes a paywall at a free paper,
  // true flashes the exam at a locked one. The loading branch below covers it.
  if (paperData && !hasAccess && !paperData.paper.isTrial) {
    return (
      <div className="min-h-screen bg-[#091526] flex items-center justify-center px-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">This paper is locked</h2>
          <p className="text-sm text-blue-200/70 mb-6 leading-relaxed">
            An active subscription is required to attempt this paper. Subscribe
            to unlock every full paper and chapter test.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Crown className="w-4 h-4" />
              View Subscription Plans
            </button>
            <button
              onClick={() => navigate('/paper-tests')}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-blue-200/60 hover:bg-white/5 transition-colors"
            >
              Back to Paper-wise Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#091526] flex items-center justify-center">
        <div className="bg-white/5 border border-red-400/40 text-red-300 rounded-lg px-8 py-6 max-w-md text-center">
          <h2 className="font-bold text-lg mb-2">Failed to load the paper</h2>
          <p className="text-sm text-red-200/80 mb-4">{loadError}</p>
          <a href="/paper-tests" className="text-xs font-semibold underline text-blue-300">
            Back to Paper-wise Tests
          </a>
        </div>
      </div>
    );
  }

  if (!paperData || questions.length === 0) {
    return (
      <div className="h-screen h-[100dvh] w-screen bg-[#091526] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-200 text-sm font-medium">Loading question paperâ€¦</p>
      </div>
    );
  }

  const examTitle = paperData.paper.title;
  const fullExamTitle = paperData.paper.fullTitle;

  // If exam submitted, show Post-Exam Results Screen once the server has
  // scored the attempt. While the score is being computed, show a brief
  // processing state; if scoring failed, offer a Retry.
  if (isTestSubmitted) {
    if (resultPayload) {
      return (
        <NtaResultScreen
          questions={questions}
          questionStates={questionStates}
          sections={sections}
          examTitle={fullExamTitle}
          onRetake={handleRetakeTest}
          result={resultPayload.result}
          keys={resultPayload.keys}
        />
      );
    }

    if (submitError) {
      return (
        <div className="h-screen h-[100dvh] w-screen bg-[#091526] flex flex-col items-center justify-center gap-4 px-6 select-none">
          <div className="w-14 h-14 bg-red-500/15 border border-red-400/40 rounded-2xl flex items-center justify-center">
            <X className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-lg">Could not score the attempt</h2>
          <p className="text-blue-200/70 text-sm max-w-sm text-center leading-relaxed">{submitError}</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => {
                setSubmitError(null);
                submitRef.current = false;
                setSubmitRetry((n) => n + 1);
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-blue-200/70 hover:bg-white/5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen h-[100dvh] w-screen bg-[#091526] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-200 text-sm font-medium">Scoring your attempt&hellip;</p>
      </div>
    );
  }

  return (
    <div
      onClick={forceFullscreen}
      className="nta-test-root h-screen h-[100dvh] w-screen overflow-hidden bg-[#091526] flex flex-col font-sans select-none relative"
    >
      {/* Orientation / rotate suggestion: only on a portrait phone, and only
          until the user starts the test-oriented flow or dismisses it. */}
      {isCompact && isPortrait && !dismissedRotateHint && !isTestSubmitted && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md bg-[#1b365d]/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-amber-400/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/15 border border-amber-400/40 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-200 uppercase tracking-wide">
                Best experience in landscape
              </p>
              <p className="text-[11px] text-blue-100/90 leading-snug mt-0.5">
                Rotate your phone for the full question paper, answer palette,
                and timer like the real NTA CBT screen.
              </p>
            </div>
            <button
              onClick={() => {
                setDismissedRotateHint(true);
                try {
                  sessionStorage.setItem(`rotate-hint-dismissed-${paperKey}`, '1');
                } catch {
                  // ignore storage failures
                }
              }}
              className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 shrink-0"
              aria-label="Dismiss rotate hint"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Short-lived Exit Hint Pop-up Toast (desktop only) */}
      {showExitHintToast && !isCompact && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1b365d]/95 text-amber-300 px-5 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-semibold border border-amber-400/60 animate-in fade-in zoom-in duration-300">
          <span>To exit full screen mode, press the Escape key.</span>
        </div>
      )}

      {/* 1. NTA Header Bar — always visible: shows candidate name + countdown
          timer even in compact landscape */}
      <NtaHeader
        examName={examTitle}
        examType={examOfPaperKey(paperKey)}
        candidateName={candidateName}
        candidateId={candidateId}
        timeLeft={timeLeft}
        onOpenQuestionPaper={() => setShowQuestionPaper(true)}
        onOpenInstructions={() => setShowInstructions(true)}
        language={language}
        onLanguageChange={setLanguage}
        compact={compactLandscape}
      />

      {/* 2. Main Test Area (Split Panel: Question Panel + Question Palette) */}
      <div className="nta-test-row flex-1 flex overflow-hidden bg-white">
        {/* Left Panel: Question Workspace */}
        <NtaQuestionPanel
          sections={sections}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          currentQuestion={currentQuestion}
          currentQuestionState={currentQuestionState}
          onSelectOption={handleSelectOption}
          onChangeNumericAnswer={handleChangeNumericAnswer}
          onSaveNext={handleSaveNext}
          onClearResponse={handleClearResponse}
          onSaveMarkReview={handleSaveMarkReview}
          onMarkReviewNext={handleMarkReviewNext}
          onNavigate={handleNavigate}
          isFirstQuestion={questions[0]?.id === currentQuestion.id}
          isLastQuestion={questions[questions.length - 1]?.id === currentQuestion.id}
          questionStates={questionStates}
          questions={questions}
          onOpenPalette={isCompact ? () => setPaletteOpen(true) : undefined}
          onSubmitTest={() => setShowSubmitModal(true)}
          compactLandscape={compactLandscape}
          isPortrait={isPortrait}
        />

        {/* Right Panel: NTA Palette — visually hidden on portrait phones and
            short landscape phones (rendered as a drawer instead); still
            rendered inline on tablet/desktop landscape */}
        {paletteInline && (
          <NtaQuestionPalette
            questions={questions}
            questionStates={questionStates}
            currentQuestionId={currentQuestion.id}
            activeSection={activeSection}
            sections={sections}
            onSelectQuestion={handleSelectQuestion}
            onSubmitTest={() => setShowSubmitModal(true)}
            candidateName={candidateName}
            wide={!isCompact}
          />
        )}
      </div>

      {/* Mobile Palette Drawer — covers 75% of the screen so the palette's
          legend, grids and submit all show in detail. Backdrop is only
          rendered while the drawer is open; tapping it closes the drawer.
          Transparent in portrait so screen brightness is unchanged. */}
      {!paletteInline && (
        <>
          {paletteOpen && (
            <div
              className="nta-palette-backdrop fixed inset-0 z-40 bg-transparent"
              onClick={() => setPaletteOpen(false)}
            />
          )}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`nta-palette-drawer fixed right-0 top-0 bottom-0 w-[75vw] max-w-[480px] shadow-2xl transition-transform duration-300 z-50 ${
              paletteOpen ? 'translate-x-0 palette-open' : 'translate-x-full'
            }`}
          >
            <NtaQuestionPalette
              questions={questions}
              questionStates={questionStates}
              currentQuestionId={currentQuestion.id}
              activeSection={activeSection}
              sections={sections}
              onSelectQuestion={(id) => {
                handleSelectQuestion(id);
                setPaletteOpen(false);
              }}
              onSubmitTest={() => {
                setPaletteOpen(false);
                setShowSubmitModal(true);
              }}
              candidateName={candidateName}
              isMobile
            />
          </div>
        </>
      )}

      {/* 3. Overlay Modals */}
      <NtaQuestionPaperModal
        isOpen={showQuestionPaper}
        onClose={() => setShowQuestionPaper(false)}
        questions={questions}
        sections={sections}
        examTitle={fullExamTitle}
      />

      <NtaInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        durationMinutes={paperData?.paper.durationMinutes ?? 180}
      />

      {/* Instruction gate — shown before a fresh paper or a retake. The
          test (and its timer) only start after the user ticks the consent
          checkbox and clicks Start Test. */}
      {!testStarted && (
        <NtaInstructionsModal
          isOpen
          startMode
          durationMinutes={paperData?.paper.durationMinutes ?? 180}
          onStart={() => {
            setTestStarted(true);
            forceFullscreen();
          }}
        />
      )}

      <NtaSubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirmSubmit={() => {
          setShowSubmitModal(false);
          setIsTestSubmitted(true);
        }}
        questions={questions}
        questionStates={questionStates}
        sections={sections}
        examTitle={fullExamTitle}
      />
    </div>
  );
}


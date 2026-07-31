import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPaperQuestions, type PaperQuestions } from '../data/questions';
import type { Question, QuestionState, QuestionStatus } from '../types';

import NtaHeader from '../components/NtaHeader';
import NtaQuestionPanel from '../components/NtaQuestionPanel';
import NtaQuestionPalette from '../components/NtaQuestionPalette';
import NtaQuestionPaperModal from '../components/NtaQuestionPaperModal';
import NtaInstructionsModal from '../components/NtaInstructionsModal';
import NtaSubmitModal from '../components/NtaSubmitModal';
import NtaResultScreen from '../components/NtaResultScreen';

const EMPTY_QUESTIONS: Question[] = [];

export default function TestInterface() {
  const [searchParams] = useSearchParams();
  const paperKey = searchParams.get('paper') || '02-apr-morning';

  const [paperData, setPaperData] = useState<PaperQuestions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Test state
  const [activeSection, setActiveSection] = useState<string>('Physics');
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>('English');
  const [isTestSubmitted, setIsTestSubmitted] = useState<boolean>(false);

  // Modals state
  const [showQuestionPaper, setShowQuestionPaper] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Short-lived Toast Popup state (shows for 2.5 seconds then vanishes)
  const [showExitHintToast, setShowExitHintToast] = useState<boolean>(true);

  // Timer: 3 Hours (180 minutes = 10800 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(180 * 60);

  const questions = paperData?.questions ?? EMPTY_QUESTIONS;

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

    getPaperQuestions(paperKey)
      .then((data) => {
        if (!cancelled) setPaperData(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load paper.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paperKey]);

  // Question States initialized to 'not-visited' (Question 1 is immediately marked 'not-answered')
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);

  // Re-initialize state once questions arrive (or paper changes)
  useEffect(() => {
    if (questions.length === 0) return;
    setQuestionStates(
      questions.map((q, idx) => ({
        id: q.id,
        status: idx === 0 ? 'not-answered' : 'not-visited',
      }))
    );
    setCurrentQuestionId(questions[0].id);
    setActiveSection('Physics');
    setTimeLeft(180 * 60);
    setIsTestSubmitted(false);
  }, [paperKey, questions]);

  const sections = ['Physics', 'Chemistry', 'Mathematics'];

  const currentQuestion =
    questions.find((q) => q.id === currentQuestionId) ?? questions[0];
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

  // Timer countdown
  useEffect(() => {
    if (isTestSubmitted) return;
    if (timeLeft <= 0) {
      setIsTestSubmitted(true);
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isTestSubmitted]);

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
    setQuestionStates(
      questions.map((q, idx) => ({
        id: q.id,
        status: idx === 0 ? 'not-answered' : 'not-visited',
      }))
    );
    setTimeLeft(180 * 60);
    setIsTestSubmitted(false);
    setCurrentQuestionId(questions[0]?.id ?? null);
    setActiveSection('Physics');
    forceFullscreen();
  };

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
      <div className="h-screen w-screen bg-[#091526] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-200 text-sm font-medium">Loading question paper…</p>
      </div>
    );
  }

  const examTitle = paperData.paper.title;
  const fullExamTitle = paperData.paper.fullTitle;

  // If exam submitted, show Post-Exam Results Screen
  if (isTestSubmitted) {
    return (
      <NtaResultScreen
        questions={questions}
        questionStates={questionStates}
        sections={sections}
        examTitle={fullExamTitle}
        onRetake={handleRetakeTest}
      />
    );
  }

  return (
    <div
      onClick={forceFullscreen}
      className="h-screen w-screen overflow-hidden bg-[#091526] flex flex-col font-sans select-none relative"
    >
      {/* Short-lived Exit Hint Pop-up Toast */}
      {showExitHintToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1b365d]/95 text-amber-300 px-5 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-semibold border border-amber-400/60 animate-in fade-in zoom-in duration-300">
          <span>To exit full screen mode, press the Escape key.</span>
        </div>
      )}

      {/* 1. NTA Header Bar */}
      <NtaHeader
        examName={examTitle}
        candidateName="ADITYA SHARMA"
        candidateId="2406001234"
        timeLeft={timeLeft}
        onOpenQuestionPaper={() => setShowQuestionPaper(true)}
        onOpenInstructions={() => setShowInstructions(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* 2. Main Test Area (Split Panel: Question Panel + Question Palette) */}
      <div className="flex-1 flex overflow-hidden bg-white">
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
        />

        {/* Right Panel: NTA Palette */}
        <NtaQuestionPalette
          questions={questions}
          questionStates={questionStates}
          currentQuestionId={currentQuestion.id}
          activeSection={activeSection}
          onSelectQuestion={handleSelectQuestion}
          onSubmitTest={() => setShowSubmitModal(true)}
          candidateName="ADITYA SHARMA"
        />
      </div>

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
      />

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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Award, BarChart2, RefreshCw, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react';
import type { Question, QuestionState } from '../types';
import QuestionDiagram from './QuestionDiagram';

interface NtaResultScreenProps {
  questions: Question[];
  questionStates: QuestionState[];
  sections: string[];
  examTitle: string;
  onRetake: () => void;
}

export default function NtaResultScreen({
  questions,
  questionStates,
  sections,
  examTitle,
  onRetake,
}: NtaResultScreenProps) {
  const navigate = useNavigate();
  const [activeFilterSection, setActiveFilterSection] = useState<string>('ALL');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<number, boolean>>({});

  // Compute evaluation statistics
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnattempted = 0;
  let totalScore = 0;

  const maxPossibleScore = questions.length * 4;

  const sectionResults = sections.map((sec) => {
    const secQuestions = questions.filter((q) => q.section === sec);
    let secCorrect = 0;
    let secIncorrect = 0;
    let secUnattempted = 0;
    let secScore = 0;

    secQuestions.forEach((q) => {
      const qState = questionStates.find((qs) => qs.id === q.id);
      const isMCQ = q.type === 'mcq' || !q.type;

      let userAns = '';
      if (isMCQ) {
        userAns = qState?.selectedOption || '';
      } else {
        userAns = qState?.numericAnswer?.trim() || '';
      }

      if (userAns !== '') {
        if (userAns.toLowerCase() === q.correctAnswer?.toLowerCase()) {
          secCorrect++;
          secScore += 4;
        } else {
          secIncorrect++;
          secScore -= 1;
        }
      } else {
        secUnattempted++;
      }
    });

    totalCorrect += secCorrect;
    totalIncorrect += secIncorrect;
    totalUnattempted += secUnattempted;
    totalScore += secScore;

    return {
      section: sec,
      total: secQuestions.length,
      correct: secCorrect,
      incorrect: secIncorrect,
      unattempted: secUnattempted,
      score: secScore,
      maxScore: secQuestions.length * 4,
    };
  });

  const attemptedCount = totalCorrect + totalIncorrect;
  const accuracy = attemptedCount > 0 ? Math.round((totalCorrect / attemptedCount) * 100) : 0;

  const filteredQuestions =
    activeFilterSection === 'ALL'
      ? questions
      : questions.filter((q) => q.section === activeFilterSection);

  const toggleSolution = (id: number) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 flex flex-col select-none">
      {/* Header */}
      <header className="bg-[#1b365d] text-white px-6 py-4 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-[#1b365d] text-xs font-black px-2 py-0.5 rounded">NTA</span>
            <h1 className="text-lg font-bold text-amber-300">Exam Results &amp; Solution Analysis</h1>
          </div>
          <p className="text-xs text-blue-200 mt-0.5">{examTitle} &bull; Official NTA Format Scorecard</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 bg-[#337ab7] hover:bg-[#286090] text-white px-4 py-2 rounded text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake Test
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Go to Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
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

        {/* Solution Analysis Section */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="bg-[#337ab7] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-sm uppercase tracking-wide">Detailed Question Solutions</h2>
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

          <div className="p-4 space-y-4">
            {filteredQuestions.map((q) => {
              const qState = questionStates.find((qs) => qs.id === q.id);
              const isMCQ = q.type === 'mcq' || !q.type;
              const userAns = isMCQ ? qState?.selectedOption || '' : qState?.numericAnswer?.trim() || '';
              const isCorrect = userAns !== '' && userAns.toLowerCase() === q.correctAnswer?.toLowerCase();
              const isUnattempted = userAns === '';
              const isExpanded = expandedSolutions[q.id] ?? true;

              return (
                <div
                  key={q.id}
                  className={`border rounded overflow-hidden shadow-xs ${
                    isCorrect
                      ? 'border-green-300 bg-green-50/20'
                      : isUnattempted
                      ? 'border-gray-200 bg-gray-50/50'
                      : 'border-red-300 bg-red-50/20'
                  }`}
                >
                  {/* Question Result Bar */}
                  <div
                    onClick={() => toggleSolution(q.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/60 transition-colors border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#1b365d] text-xs">
                        Q.{q.number} ({q.section})
                      </span>
                      {isCorrect ? (
                        <span className="bg-green-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                          CORRECT (+4)
                        </span>
                      ) : isUnattempted ? (
                        <span className="bg-gray-500 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                          UNATTEMPTED (0)
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                          INCORRECT (-1)
                        </span>
                      )}
                    </div>
                    <button className="text-gray-500 hover:text-gray-800">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 bg-white text-xs space-y-3">
                      <p className="font-semibold text-gray-900 leading-relaxed text-sm">
                        {q.text}
                      </p>

                      <QuestionDiagram questionId={q.id} />

                      {/* Options */}
                      {isMCQ && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
                          {q.options.map((opt) => {
                            const isUserChoice = userAns === opt.label;
                            const isCorrectChoice = q.correctAnswer === opt.label;
                            let style = 'bg-gray-50 border-gray-200 text-gray-700';

                            if (isCorrectChoice) {
                              style = 'bg-green-100 border-green-400 text-green-900 font-bold';
                            } else if (isUserChoice && !isCorrectChoice) {
                              style = 'bg-red-100 border-red-400 text-red-900 font-bold';
                            }

                            return (
                              <div key={opt.label} className={`p-2 border rounded text-xs flex items-center justify-between ${style}`}>
                                <span><strong className="mr-1">({opt.label})</strong> {opt.text}</span>
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
                        <div>Correct Answer: <strong className="text-green-700">{q.correctAnswer}</strong></div>
                      </div>

                      {/* Solution */}
                      {q.solution && (
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-xs text-amber-950">
                          <strong className="block text-[#1b365d] mb-1 font-bold">Explanation &amp; Solution:</strong>
                          <p className="leading-relaxed">{q.solution}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

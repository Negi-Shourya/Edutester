import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Delete } from 'lucide-react';
import type { Question, QuestionState } from '../types';
import QuestionDiagram from './QuestionDiagram';
import FormattedQuestionText from './FormattedQuestionText';

interface NtaQuestionPanelProps {
  sections: string[];
  activeSection: string;
  onSelectSection: (section: string) => void;
  currentQuestion: Question;
  currentQuestionState?: QuestionState;
  onSelectOption: (optionLabel: string) => void;
  onChangeNumericAnswer: (value: string) => void;
  onSaveNext: () => void;
  onClearResponse: () => void;
  onSaveMarkReview: () => void;
  onMarkReviewNext: () => void;
  onNavigate: (direction: number) => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  questionStates: QuestionState[];
  questions: Question[];
}

export default function NtaQuestionPanel({
  sections,
  activeSection,
  onSelectSection,
  currentQuestion,
  currentQuestionState,
  onSelectOption,
  onChangeNumericAnswer,
  onSaveNext,
  onClearResponse,
  onSaveMarkReview,
  onMarkReviewNext,
  onNavigate,
  isFirstQuestion,
  isLastQuestion,
  questionStates,
  questions,
}: NtaQuestionPanelProps) {
  const [fontSizeClass, setFontSizeClass] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-sm');

  // Keypad click handler for Numerical questions
  const handleKeypadPress = (val: string) => {
    const current = currentQuestionState?.numericAnswer || '';
    if (val === 'CLEAR') {
      onChangeNumericAnswer('');
    } else if (val === 'BACKSPACE') {
      onChangeNumericAnswer(current.slice(0, -1));
    } else if (val === '-') {
      if (!current.startsWith('-')) onChangeNumericAnswer('-' + current);
      else onChangeNumericAnswer(current.slice(1));
    } else if (val === '.') {
      if (!current.includes('.')) onChangeNumericAnswer(current + '.');
    } else {
      onChangeNumericAnswer(current + val);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white select-none">
      {/* 1. Section Selection Tabs Bar */}
      <div className="bg-[#e9ecef] border-b border-[#ccc] px-3 pt-2 flex items-center justify-between shrink-0">
        <div className="flex items-end gap-1 overflow-x-auto nta-scrollbar">
          {sections.map((section) => {
            const isSelected = activeSection === section;
            const sectionQs = questions.filter((q) => q.section === section);
            const answeredCount = sectionQs.filter((q) => {
              const st = questionStates.find((qs) => qs.id === q.id)?.status;
              return st === 'answered' || st === 'answered-marked';
            }).length;

            return (
              <button
                key={section}
                onClick={() => onSelectSection(section)}
                className={`px-4 py-2 text-xs font-bold rounded-t border-t border-x transition-all uppercase cursor-pointer ${
                  isSelected
                    ? 'bg-[#337ab7] text-white border-[#2e6da4] shadow-sm'
                    : 'bg-[#f8f9fa] text-[#333] border-[#ccc] hover:bg-white'
                }`}
              >
                {section}{' '}
                <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ml-1 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {answeredCount}/{sectionQs.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Font Size Adjusters */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-gray-600 mb-1">
          <span className="font-semibold text-gray-700 mr-1">Zoom:</span>
          <button
            onClick={() => setFontSizeClass('text-sm')}
            className={`px-2 py-0.5 border rounded cursor-pointer ${fontSizeClass === 'text-sm' ? 'bg-[#337ab7] text-white font-bold' : 'bg-white text-gray-700'}`}
          >
            A
          </button>
          <button
            onClick={() => setFontSizeClass('text-base')}
            className={`px-2 py-0.5 border rounded cursor-pointer ${fontSizeClass === 'text-base' ? 'bg-[#337ab7] text-white font-bold' : 'bg-white text-gray-700'}`}
          >
            A+
          </button>
          <button
            onClick={() => setFontSizeClass('text-lg')}
            className={`px-2 py-0.5 border rounded cursor-pointer ${fontSizeClass === 'text-lg' ? 'bg-[#337ab7] text-white font-bold' : 'bg-white text-gray-700'}`}
          >
            A++
          </button>
        </div>
      </div>

      {/* 2. Question Info Bar */}
      <div className="bg-[#428bca] text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-[#357ebd] shrink-0">
        <div className="flex items-center gap-2">
          <span>Question Type : <span className="font-bold text-amber-200">{currentQuestion.type === 'numerical' ? 'Numerical Value Question' : 'Multiple Choice Question'}</span></span>
          {currentQuestion.subSection && (
            <span className="bg-[#1b365d] text-white text-[10px] px-2 py-0.5 rounded font-bold">
              {currentQuestion.subSection}
            </span>
          )}
        </div>
        <div className="text-[11px] text-blue-100 flex items-center gap-3">
          <span>Marks for correct answer: <strong className="text-green-300">+4</strong></span>
          <span>|</span>
          <span>Negative marks: <strong className="text-red-300">-1</strong></span>
        </div>
      </div>

      {/* 3. Main Question View Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-white nta-scrollbar">
        {/* Question Header */}
        <div className="border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
          <div className="font-bold text-[#1b365d] text-sm">
            Question No. {currentQuestion.number}
          </div>
          <div className="text-xs text-gray-400">
            {activeSection} &bull; {currentQuestion.subSection || 'Section A'}
          </div>
        </div>

        {/* Question Text */}
        <div className={`text-gray-900 font-medium leading-relaxed mb-4 ${fontSizeClass}`}>
          <span className="font-bold text-[#1b365d] mr-1">{currentQuestion.number}.</span>
          <FormattedQuestionText text={currentQuestion.text} />
        </div>

        {/* Inline Diagram / Figure if available for this question */}
        <QuestionDiagram questionId={currentQuestion.id} />

        {/* Answer Selection Input View */}
        {currentQuestion.type === 'numerical' ? (
          /* Numerical Input with Virtual Keypad */
          <div className="max-w-md bg-gray-50 border border-gray-300 rounded p-4 shadow-sm my-4">
            <label className="block text-xs font-bold text-[#1b365d] mb-2 uppercase tracking-wide">
              Enter your Answer (Numerical Value):
            </label>
            <input
              type="text"
              value={currentQuestionState?.numericAnswer || ''}
              onChange={(e) => onChangeNumericAnswer(e.target.value)}
              placeholder="e.g. 25 or -4.5"
              className="w-full bg-white border-2 border-[#337ab7] rounded px-3 py-2 text-lg font-mono font-bold text-center text-[#1b365d] outline-none shadow-inner mb-4 focus:ring-2 focus:ring-[#337ab7]"
            />

            {/* Virtual NTA Numeric Keypad */}
            <div className="bg-white border border-gray-200 p-3 rounded shadow-xs">
              <div className="text-[11px] font-semibold text-gray-500 mb-2 text-center">On-Screen Keypad</div>
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0', '.'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeypadPress(key)}
                    className="py-2.5 bg-[#f8f9fa] hover:bg-[#e2e6ea] active:bg-[#dae0e5] text-gray-800 font-bold border border-gray-300 rounded text-sm transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleKeypadPress('BACKSPACE')}
                  className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-300 rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Delete className="w-3.5 h-3.5" /> Backspace
                </button>
                <button
                  onClick={() => handleKeypadPress('CLEAR')}
                  className="py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-300 rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MCQ Options View */
          <div className="space-y-3 max-w-2xl my-4">
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option) => {
                const isSelected = currentQuestionState?.selectedOption === option.label;
                return (
                  <div
                    key={option.label}
                    onClick={() => onSelectOption(option.label)}
                    className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#337ab7] bg-[#ebf3fb] ring-1 ring-[#337ab7] shadow-xs'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={isSelected}
                      readOnly
                      className="mt-0.5 accent-[#337ab7] w-4 h-4 cursor-pointer pointer-events-none"
                    />
                    <span className={`text-gray-800 ${fontSizeClass}`}>
                      <span className="font-bold text-[#1b365d] mr-1.5">({option.label})</span>
                      {option.text}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs font-semibold">
                No options defined for this question.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Control Bar (Exact NTA 4 Buttons + Navigation) */}
      <div className="bg-[#e9ecef] border-t border-[#ccc] px-4 py-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Save & Next (Green) */}
            <button
              onClick={onSaveNext}
              className="bg-[#28a745] hover:bg-[#218838] active:bg-[#1e7e34] text-white px-4 py-2 rounded text-xs font-bold border border-[#1e7e34] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide"
            >
              Save & Next
            </button>

            {/* Clear Response (White) */}
            <button
              onClick={onClearResponse}
              className="bg-white hover:bg-gray-100 active:bg-gray-200 text-[#333] px-4 py-2 rounded text-xs font-bold border border-[#ccc] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide"
            >
              Clear Response
            </button>

            {/* Save & Mark for Review (Orange) */}
            <button
              onClick={onSaveMarkReview}
              className="bg-[#ff9800] hover:bg-[#e68a00] active:bg-[#cc7a00] text-white px-4 py-2 rounded text-xs font-bold border border-[#b36b00] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide"
            >
              Save & Mark for Review
            </button>

            {/* Mark for Review & Next (Blue) */}
            <button
              onClick={onMarkReviewNext}
              className="bg-[#337ab7] hover:bg-[#286090] active:bg-[#204d74] text-white px-4 py-2 rounded text-xs font-bold border border-[#204d74] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide"
            >
              Mark for Review & Next
            </button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onNavigate(-1)}
              disabled={isFirstQuestion}
              className="bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 px-3 py-2 rounded text-xs font-bold border border-gray-300 shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> &lt;&lt; Back
            </button>
            <button
              onClick={() => onNavigate(1)}
              disabled={isLastQuestion}
              className="bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 px-3 py-2 rounded text-xs font-bold border border-gray-300 shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              Next &gt;&gt; <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

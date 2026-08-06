import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Delete, LayoutGrid } from 'lucide-react';
import type { Question, QuestionState } from '../types';
import QuestionDiagram from './QuestionDiagram';
import FormattedQuestionText from './FormattedQuestionText';
import VectorText from './VectorText';

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
  onOpenPalette?: () => void;
  onSubmitTest?: () => void;
  compactLandscape?: boolean;
  isPortrait?: boolean;
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
  onOpenPalette,
  onSubmitTest,
  compactLandscape = false,
  isPortrait = false,
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

  const bottomControls = (
    <div className={`nta-bottom-controls ${compactLandscape ? 'flex flex-row items-center gap-1' : 'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2'}`}>
      {/* Action Buttons Group */}
      <div className={compactLandscape ? 'flex flex-nowrap items-stretch gap-1' : 'grid grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-2'}>
        {/* Save & Next (Green) */}
        <button
          onClick={onSaveNext}
          className={compactLandscape ? 'touch-target-32 bg-[#28a745] hover:bg-[#218838] active:bg-[#1e7e34] text-white px-1.5 py-1 rounded text-[9px] font-bold border border-[#1e7e34] shadow-xs cursor-pointer transition-all active:scale-95 uppercase whitespace-nowrap' : 'touch-target bg-[#28a745] hover:bg-[#218838] active:bg-[#1e7e34] text-white px-3 sm:px-4 py-2 rounded text-[11px] sm:text-xs font-bold border border-[#1e7e34] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide'}
        >
          Save &amp; Next
        </button>

        {/* Clear Response (White) */}
        <button
          onClick={onClearResponse}
          className={compactLandscape ? 'touch-target-32 bg-white hover:bg-gray-100 active:bg-gray-200 text-[#333] px-1.5 py-1 rounded text-[9px] font-bold border border-[#ccc] shadow-xs cursor-pointer transition-all active:scale-95 uppercase whitespace-nowrap' : 'touch-target bg-white hover:bg-gray-100 active:bg-gray-200 text-[#333] px-3 sm:px-4 py-2 rounded text-[11px] sm:text-xs font-bold border border-[#ccc] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide'}
        >
          Clear
        </button>

        {/* Save & Mark for Review (Orange) */}
        <button
          onClick={onSaveMarkReview}
          className={compactLandscape ? 'touch-target-32 bg-[#ff9800] hover:bg-[#e68a00] active:bg-[#cc7a00] text-white px-1.5 py-1 rounded text-[9px] font-bold border border-[#b36b00] shadow-xs cursor-pointer transition-all active:scale-95 uppercase whitespace-nowrap' : 'touch-target bg-[#ff9800] hover:bg-[#e68a00] active:bg-[#cc7a00] text-white px-3 sm:px-4 py-2 rounded text-[11px] sm:text-xs font-bold border border-[#b36b00] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide'}
        >
          Save &amp; Review
        </button>

        {/* Review & Next (Blue) */}
        <button
          onClick={onMarkReviewNext}
          className={compactLandscape ? 'touch-target-32 bg-[#337ab7] hover:bg-[#286090] active:bg-[#204d74] text-white px-1.5 py-1 rounded text-[9px] font-bold border border-[#204d74] shadow-xs cursor-pointer transition-all active:scale-95 uppercase whitespace-nowrap' : 'touch-target bg-[#337ab7] hover:bg-[#286090] active:bg-[#204d74] text-white px-3 sm:px-4 py-2 rounded text-[11px] sm:text-xs font-bold border border-[#204d74] shadow-sm cursor-pointer transition-all active:scale-95 uppercase tracking-wide'}
        >
          Review &amp; Next
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className={compactLandscape ? 'flex flex-nowrap items-stretch gap-1 ml-auto' : 'flex items-center gap-1 sm:ml-auto justify-end'}>
        {onSubmitTest && (
          <button
            onClick={onSubmitTest}
            className="touch-target-32 bg-[#dc3545] hover:bg-[#c82333] text-white px-2 py-1 rounded text-[9px] font-bold border border-[#bd2130] shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
          >
            Submit
          </button>
        )}
        <button
          onClick={() => onNavigate(-1)}
          disabled={isFirstQuestion}
          className="touch-target-32 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 px-1.5 py-1 rounded text-[9px] font-bold border border-gray-300 shadow-xs flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
        >
          <ChevronLeft className="w-3 h-3" /> &lt;&lt; Back
        </button>
        <button
          onClick={() => onNavigate(1)}
          disabled={isLastQuestion}
          className="touch-target-32 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-700 px-1.5 py-1 rounded text-[9px] font-bold border border-gray-300 shadow-xs flex items-center gap-0.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
        >
          Next &gt;&gt; <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="nta-question-pane flex-1 flex flex-col h-full overflow-hidden bg-white select-none">
      {/* 1. Section Selection Tabs Bar — always visible so users can switch
          Physics / Chemistry / Mathematics even in compact landscape */}
      <div className="nta-section-tabs bg-[#e9ecef] border-b border-[#ccc] px-3 pt-2 flex items-center justify-between shrink-0">
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

          {/* Font Size Adjusters — hidden on phone landscape; the palette
              button takes its place in the top-right corner */}
          {compactLandscape ? (
            onOpenPalette && (
              <button
                onClick={onOpenPalette}
                onMouseDown={(e) => e.stopPropagation()}
                className="touch-target-32 bg-[#1b365d] hover:bg-[#0f2444] text-amber-300 px-2 py-1 rounded text-[10px] font-bold border border-[#0d2242] shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0 mb-1"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Palette
              </button>
            )
          ) : (
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
          )}
        </div>

      {/* 2. Question Info Bar (hidden in compact landscape) */}
      <div className={compactLandscape ? 'hidden' : 'bg-[#428bca] text-white px-3 py-1.5 text-[11px] sm:text-xs font-semibold flex flex-wrap items-center justify-between gap-1 border-b border-[#357ebd] shrink-0'}>
        <div className="flex items-center gap-2 min-w-0 mr-auto">
          <span className="truncate">Question Type : <span className="font-bold text-amber-200">{currentQuestion.type === 'numerical' ? 'Numerical Value Question' : 'Multiple Choice Question'}</span></span>
          {!isPortrait && currentQuestion.subSection && (
            <span className="bg-[#1b365d] text-white text-[10px] px-2 py-0.5 rounded font-bold shrink-0">
              {currentQuestion.subSection}
            </span>
          )}
        </div>
        <div className="text-[10px] sm:text-[11px] text-blue-100 flex items-center gap-2 shrink-0">
          <span>Marks: <strong className="text-green-300">+{currentQuestion.marks ?? 4}</strong></span>
          <span className="text-blue-200/60">|</span>
          <span>Negative: <strong className="text-red-300">{currentQuestion.negativeMarks ?? -1}</strong></span>
        </div>
        {onOpenPalette && (
          <button
            onClick={onOpenPalette}
            onMouseDown={(e) => e.stopPropagation()}
            className="md:hidden touch-target-40 bg-[#1b365d] hover:bg-[#0f2444] text-amber-300 px-2.5 py-1 rounded text-[11px] font-bold border border-[#0d2242] shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Palette
          </button>
        )}
      </div>

      {/* 3. Main Question View Area (scrollable) */}
      <div className="nta-question-scroll flex-1 overflow-y-auto bg-white nta-scrollbar p-4">
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
        <QuestionDiagram figureUrl={currentQuestion.figureUrl} />

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
                    className="touch-target-40 py-2.5 bg-[#f8f9fa] hover:bg-[#e2e6ea] active:bg-[#dae0e5] text-gray-800 font-bold border border-gray-300 rounded text-sm transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleKeypadPress('BACKSPACE')}
                  className="touch-target-40 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-300 rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Delete className="w-3.5 h-3.5" /> Backspace
                </button>
                <button
                  onClick={() => handleKeypadPress('CLEAR')}
                  className="touch-target-40 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-300 rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
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
                    className={`nta-option-row flex items-start gap-3 p-3 rounded border transition-all cursor-pointer ${
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
                      {option.text ? (
                        <VectorText text={option.text} />
                      ) : (
                        option.figureUrl && (
                          <img
                            src={option.figureUrl}
                            alt={`Option ${option.label}`}
                            className="max-w-full h-auto rounded-sm"
                          />
                        )
                      )}
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

        {/* Bottom controls inside the scroll in compact landscape so they
            appear only when the user scrolls past the question */}
        {compactLandscape && bottomControls}
      </div>

      {/* 4. Bottom Control Bar — fixed footer on desktop/portrait */}
      {!compactLandscape && (
        <div className="bg-[#e9ecef] border-t border-[#ccc] px-3 sm:px-4 py-2.5 shrink-0 safe-area-pad">
          {bottomControls}
        </div>
      )}
    </div>
  );
}
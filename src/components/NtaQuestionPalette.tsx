import type { Question, QuestionState, QuestionStatus } from '../types';

interface NtaQuestionPaletteProps {
  questions: Question[];
  questionStates: QuestionState[];
  currentQuestionId: number;
  activeSection: string;
  onSelectQuestion: (questionId: number) => void;
  onSubmitTest: () => void;
  candidateName: string;
}

export default function NtaQuestionPalette({
  questions,
  questionStates,
  currentQuestionId,
  activeSection,
  onSelectQuestion,
  onSubmitTest,
  candidateName,
}: NtaQuestionPaletteProps) {
  // Count states across all questions
  const stateCounts = questionStates.reduce((acc, qState) => {
    acc[qState.status] = (acc[qState.status] || 0) + 1;
    return acc;
  }, {} as Record<QuestionStatus, number>);

  // Filter questions for active section
  const sectionQuestions = questions.filter((q) => q.section === activeSection);

  // Group section questions into Section A and Section B if available
  const sectionAQs = sectionQuestions.filter((q) => q.subSection === 'Section A' || !q.subSection);
  const sectionBQs = sectionQuestions.filter((q) => q.subSection === 'Section B');

  const renderBadge = (status: QuestionStatus, count: number, label: string) => {
    let shapeClass = '';
    if (status === 'not-visited') shapeClass = 'nta-shape-not-visited';
    if (status === 'not-answered') shapeClass = 'nta-shape-not-answered';
    if (status === 'answered') shapeClass = 'nta-shape-answered';
    if (status === 'marked') shapeClass = 'nta-shape-marked';
    if (status === 'answered-marked') shapeClass = 'nta-shape-answered-marked';

    return (
      <div className="flex items-start gap-2 text-[11px] leading-tight">
        <div className={`w-7 h-6 flex items-center justify-center font-bold text-xs shrink-0 ${shapeClass}`}>
          {count}
        </div>
        <span className="text-gray-700 font-medium py-0.5">{label}</span>
      </div>
    );
  };

  const renderGridButton = (q: Question) => {
    const qState = questionStates.find((qs) => qs.id === q.id);
    const status = qState?.status || 'not-visited';
    const isCurrent = q.id === currentQuestionId;

    let shapeClass = '';
    if (status === 'not-visited') shapeClass = 'nta-shape-not-visited';
    if (status === 'not-answered') shapeClass = 'nta-shape-not-answered';
    if (status === 'answered') shapeClass = 'nta-shape-answered';
    if (status === 'marked') shapeClass = 'nta-shape-marked';
    if (status === 'answered-marked') shapeClass = 'nta-shape-answered-marked';

    return (
      <button
        key={q.id}
        onClick={() => onSelectQuestion(q.id)}
        className={`w-9 h-8 text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 ${shapeClass} ${
          isCurrent ? 'ring-2 ring-blue-600 ring-offset-1 scale-105 z-10 shadow-md border-blue-600' : ''
        }`}
        title={`Q.${q.number} (${q.section} ${q.subSection || ''}) - Status: ${status}`}
      >
        {q.number}
      </button>
    );
  };

  return (
    <div className="w-[310px] shrink-0 bg-[#eef2f7] border-l border-[#c0cbd8] flex flex-col h-full overflow-hidden select-none">
      {/* Candidate Card Bar */}
      <div className="bg-[#337ab7] text-white p-2.5 flex items-center gap-3 border-b border-[#285f91]">
        <div className="w-10 h-10 rounded bg-white p-0.5 border border-white/40 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="text-xs leading-snug truncate">
          <div className="text-[10px] text-[#d0e3f7] uppercase font-semibold">System Name : <span className="text-white font-mono">C001</span></div>
          <div className="font-bold text-white truncate max-w-[170px]">{candidateName}</div>
          <div className="text-[10px] text-amber-200">Subject : <span className="font-semibold">{activeSection}</span></div>
        </div>
      </div>

      {/* NTA Palette Legend Container */}
      <div className="p-2.5 bg-white border-b border-[#c0cbd8] space-y-2 text-xs shadow-xs">
        <h4 className="font-bold text-[#1b365d] border-b pb-1 text-[11px] uppercase tracking-wide">Question Palette Legend</h4>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {renderBadge('answered', stateCounts['answered'] || 0, 'Answered')}
          {renderBadge('not-answered', stateCounts['not-answered'] || 0, 'Not Answered')}
          {renderBadge('marked', stateCounts['marked'] || 0, 'Marked for Review')}
          {renderBadge('not-visited', stateCounts['not-visited'] || 0, 'Not Visited')}
        </div>
        <div className="pt-1 border-t border-gray-100">
          {renderBadge(
            'answered-marked',
            stateCounts['answered-marked'] || 0,
            'Answered & Marked for Review (will be considered for evaluation)'
          )}
        </div>
      </div>

      {/* Section Filter Header */}
      <div className="bg-[#337ab7] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between border-b border-[#285f91]">
        <span>Choose a Question</span>
        <span className="text-[10px] font-normal text-blue-100">{activeSection}</span>
      </div>

      {/* Scrollable Palette Buttons */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#f8fafc] nta-scrollbar space-y-4">
        {/* Section A */}
        {sectionAQs.length > 0 && (
          <div>
            {sectionBQs.length > 0 && (
              <div className="text-[11px] font-bold text-[#1b365d] mb-1.5 pb-0.5 border-b border-gray-300">
                Section A - Multiple Choice Questions
              </div>
            )}
            <div className="grid grid-cols-5 gap-2">
              {sectionAQs.map(renderGridButton)}
            </div>
          </div>
        )}

        {/* Section B (Numerical Value Qs) */}
        {sectionBQs.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-[#1b365d] mb-1.5 pb-0.5 border-b border-gray-300">
              Section B - Numerical Value Questions
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sectionBQs.map(renderGridButton)}
            </div>
          </div>
        )}
      </div>

      {/* Submit Test Button Container */}
      <div className="p-3 bg-white border-t border-[#c0cbd8] text-center shadow-lg shrink-0">
        <button
          onClick={onSubmitTest}
          className="w-full py-2 bg-[#28a745] hover:bg-[#218838] active:bg-[#1e7e34] text-white text-xs font-bold rounded shadow-md border border-[#1e7e34] transition-all uppercase tracking-wider cursor-pointer"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
}

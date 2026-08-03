import { useEffect, useState } from 'react';
import type { Question, QuestionState } from '../types';

interface NtaQuestionPaletteProps {
  questions: Question[];
  questionStates: QuestionState[];
  currentQuestionId: number;
  activeSection: string;
  sections?: string[];
  onSelectQuestion: (questionId: number) => void;
  onSubmitTest: () => void;
  candidateName: string;
  isMobile?: boolean;
  wide?: boolean;
}

export default function NtaQuestionPalette({
  questions,
  questionStates,
  currentQuestionId,
  activeSection,
  sections,
  onSelectQuestion,
  onSubmitTest,
  candidateName,
  isMobile,
  wide,
}: NtaQuestionPaletteProps) {
  // NTA palette shows section tabs; clicking a tab shows that section's
  // question numbers. Clicking a number in another section navigates there
  // and switches the active section (handleSelectQuestion already does this).
  const paletteSections =
    sections ?? Array.from(new Set(questions.map((q) => q.section)));

  // Selected section tab — follows the active section from outside
  const [selectedSection, setSelectedSection] = useState(activeSection);
  useEffect(() => {
    setSelectedSection(activeSection);
  }, [activeSection]);

  // Group a section's questions into Section A and Section B if available
  const groupSection = (section: string) => {
    const secQs = questions.filter((q) => q.section === section);
    return {
      sectionAQs: secQs.filter((q) => q.subSection === 'Section A' || !q.subSection),
      sectionBQs: secQs.filter((q) => q.subSection === 'Section B'),
    };
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
          isMobile ? 'w-full h-9' : ''
        } ${
          isCurrent ? 'ring-2 ring-blue-600 ring-offset-1 scale-105 z-10 shadow-md border-blue-600' : ''
        }`}
        title={`Q.${q.number} (${q.section} ${q.subSection || ''}) - Status: ${status}`}
      >
        {q.number}
      </button>
    );
  };

  const renderSectionGrid = (section: string) => {
    const { sectionAQs, sectionBQs } = groupSection(section);
    if (sectionAQs.length === 0 && sectionBQs.length === 0) {
      return <div className="p-3 text-xs text-gray-500">No questions in this section.</div>;
    }
    return (
      <div className="space-y-4">
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
    );
  };

  return (
    <div
      className={`nta-palette-pane ${
        isMobile ? 'w-full' : wide ? 'w-[min(300px,30vw)]' : 'w-[310px]'
      } shrink-0 bg-[#eef2f7] border-l border-[#c0cbd8] flex flex-col h-full overflow-hidden select-none`}
    >
      {/* Mobile drawer handle + close */}
      {isMobile && (
        <div className="bg-[#1b365d] text-white px-3 py-2 flex items-center justify-between border-b border-[#0f2444]">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-300">
            Question Palette
          </span>
          <button
            onClick={onSubmitTest}
            className="md:hidden text-[10px] font-bold text-white/90 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded border border-white/20"
          >
            SUBMIT
          </button>
        </div>
      )}

      {/* Candidate Card Bar (no photo — System Name + Name on one line) */}
      <div className="bg-[#337ab7] text-white px-2.5 py-1.5 flex items-center gap-2 border-b border-[#285f91]">
        <div className="text-[10px] text-[#d0e3f7] uppercase font-semibold whitespace-nowrap">
          System Name : <span className="text-white font-mono">C001</span>
        </div>
        <span className="text-white/40 shrink-0">|</span>
        <div className="text-[10px] text-[#d0e3f7] uppercase font-semibold min-w-0 truncate">
          Name : <span className="text-white font-bold truncate">{candidateName}</span>
        </div>
      </div>

      {/* Section Tabs — click a tab to see that section's questions */}
      <div className="bg-[#1b365d] px-2 py-1.5 flex items-center gap-1 border-b border-[#0f2444]">
        {paletteSections.map((section) => {
          const isActive = section === selectedSection;
          return (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`flex-1 py-1.5 px-1 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#1b365d] shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {section}
            </button>
          );
        })}
      </div>

      {/* Scrollable Question Numbers for the selected section */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#f8fafc] nta-scrollbar">
        {renderSectionGrid(selectedSection)}
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

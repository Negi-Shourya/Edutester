import { useState } from 'react';
import { X, Printer } from 'lucide-react';
import type { Question } from '../types';
import QuestionDiagram from './QuestionDiagram';
import VectorText from './VectorText';

interface NtaQuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  sections: string[];
  examTitle: string;
}

export default function NtaQuestionPaperModal({
  isOpen,
  onClose,
  questions,
  sections,
  examTitle,
}: NtaQuestionPaperModalProps) {
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredQuestions =
    selectedSection === 'ALL'
      ? questions
      : questions.filter((q) => q.section === selectedSection);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded border-2 border-[#1b365d] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1b365d] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-[#0f2444]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 bg-amber-400 text-[#1b365d] font-black rounded flex items-center justify-center text-xs shrink-0">
              QP
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-amber-300 uppercase tracking-wide truncate">
              {examTitle} - Complete Question Paper
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded flex items-center gap-1 border border-white/20"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="bg-[#e9ecef] border-b border-[#ccc] px-4 py-2 flex items-center gap-2 overflow-x-auto nta-scrollbar shrink-0">
          <span className="text-xs font-bold text-gray-700 mr-1 shrink-0">Filter:</span>
          <button
            onClick={() => setSelectedSection('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded cursor-pointer shrink-0 ${
              selectedSection === 'ALL'
                ? 'bg-[#337ab7] text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All ({questions.length})
          </button>
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSection(s)}
              className={`px-3 py-1 text-xs font-bold rounded cursor-pointer shrink-0 ${
                selectedSection === s
                  ? 'bg-[#337ab7] text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {s} ({questions.filter((q) => q.section === s).length})
            </button>
          ))}
        </div>

        {/* Scrollable Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 nta-scrollbar bg-[#f8fafc]">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-gray-300 rounded p-4 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                <span className="font-bold text-[#1b365d] text-sm">
                  {q.section} &bull; {q.subSection || 'Section A'} &bull; Question {q.number}
                </span>
                <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                  Type: {q.type === 'numerical' ? 'Numerical' : 'MCQ'} | Marks: +{q.marks ?? 4}, {q.negativeMarks ?? -1}
                </span>
              </div>

              <p className="text-gray-900 font-medium text-sm leading-relaxed mb-3">
                <VectorText text={q.text} />
              </p>

              <QuestionDiagram figureUrl={q.figureUrl} />

              {q.type === 'mcq' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt) => (
                    <div
                      key={opt.label}
                      className="p-2 border border-gray-200 rounded bg-gray-50 text-gray-800"
                    >
                      <span className="font-bold text-[#1b365d] mr-1">({opt.label})</span>{' '}
                      {opt.figureUrl && (
                        <img
                          src={opt.figureUrl}
                          alt={`Option ${opt.label}`}
                          className="max-h-64 max-w-full h-auto object-contain rounded-sm"
                        />
                      )}
                      {opt.text && <VectorText text={opt.text} />}
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'numerical' && (
                <div className="text-xs text-blue-700 font-semibold italic bg-blue-50 p-2 rounded border border-blue-200">
                  Numeric Answer required (e.g. integer or decimal).
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-[#e9ecef] border-t border-[#ccc] px-4 py-2.5 text-right">
          <button
            onClick={onClose}
            className="bg-[#337ab7] hover:bg-[#286090] text-white px-5 py-1.5 rounded text-xs font-bold uppercase cursor-pointer"
          >
            Close Question Paper
          </button>
        </div>
      </div>
    </div>
  );
}

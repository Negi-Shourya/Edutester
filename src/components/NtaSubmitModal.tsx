import { AlertCircle } from 'lucide-react';
import type { Question, QuestionState } from '../types';

interface NtaSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  questions: Question[];
  questionStates: QuestionState[];
  sections: string[];
  examTitle: string;
}

export default function NtaSubmitModal({
  isOpen,
  onClose,
  onConfirmSubmit,
  questions,
  questionStates,
  sections,
  examTitle,
}: NtaSubmitModalProps) {
  if (!isOpen) return null;

  // Compute breakdown per section
  const sectionStats = sections.map((secName) => {
    const secQuestions = questions.filter((q) => q.section === secName);
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    secQuestions.forEach((q) => {
      const qSt = questionStates.find((qs) => qs.id === q.id);
      const st = qSt?.status || 'not-visited';
      if (st === 'answered') answered++;
      else if (st === 'not-answered') notAnswered++;
      else if (st === 'marked') marked++;
      else if (st === 'answered-marked') answeredMarked++;
      else notVisited++;
    });

    return {
      section: secName,
      total: secQuestions.length,
      answered,
      notAnswered,
      marked,
      answeredMarked,
      notVisited,
    };
  });

  // Overall totals
  const overallTotal = questions.length;
  const overallAnswered = sectionStats.reduce((a, b) => a + b.answered, 0);
  const overallNotAnswered = sectionStats.reduce((a, b) => a + b.notAnswered, 0);
  const overallMarked = sectionStats.reduce((a, b) => a + b.marked, 0);
  const overallAnsweredMarked = sectionStats.reduce((a, b) => a + b.answeredMarked, 0);
  const overallNotVisited = sectionStats.reduce((a, b) => a + b.notVisited, 0);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded border-2 border-[#1b365d] w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="bg-[#1b365d] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#0f2444]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-300" />
            <h2 className="font-bold text-sm text-amber-300 uppercase tracking-wide">
              Exam Summary - {examTitle}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 text-xs text-gray-800 space-y-4">
          <p className="text-sm font-bold text-[#1b365d] text-center">
            Below is the summary of your exam status across all sections:
          </p>

          {/* NTA Summary Table */}
          <div className="border border-[#ccc] rounded overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#337ab7] text-white font-bold border-b border-[#285f91]">
                  <th className="p-2 border.r border-blue-400">Section Name</th>
                  <th className="p-2 text-center border-r border-blue-400">No. of Questions</th>
                  <th className="p-2 text-center border-r border-blue-400 bg-green-700">Answered</th>
                  <th className="p-2 text-center border-r border-blue-400 bg-red-700">Not Answered</th>
                  <th className="p-2 text-center border-r border-blue-400 bg-purple-700">Marked for Review</th>
                  <th className="p-2 text-center border-r border-blue-400 bg-purple-800">Answered &amp; Marked</th>
                  <th className="p-2 text-center bg-gray-600">Not Visited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sectionStats.map((row) => (
                  <tr key={row.section} className="hover:bg-gray-50">
                    <td className="p-2.5 font-bold text-[#1b365d] border-r">{row.section}</td>
                    <td className="p-2.5 text-center font-semibold border-r">{row.total}</td>
                    <td className="p-2.5 text-center font-bold text-green-700 border-r">{row.answered}</td>
                    <td className="p-2.5 text-center font-bold text-red-600 border-r">{row.notAnswered}</td>
                    <td className="p-2.5 text-center font-bold text-purple-700 border-r">{row.marked}</td>
                    <td className="p-2.5 text-center font-bold text-purple-900 border-r">{row.answeredMarked}</td>
                    <td className="p-2.5 text-center font-semibold text-gray-500">{row.notVisited}</td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300 text-gray-900">
                  <td className="p-2.5 border-r">TOTAL</td>
                  <td className="p-2.5 text-center border-r">{overallTotal}</td>
                  <td className="p-2.5 text-center text-green-700 border-r">{overallAnswered}</td>
                  <td className="p-2.5 text-center text-red-600 border-r">{overallNotAnswered}</td>
                  <td className="p-2.5 text-center text-purple-700 border-r">{overallMarked}</td>
                  <td className="p-2.5 text-center text-purple-900 border-r">{overallAnsweredMarked}</td>
                  <td className="p-2.5 text-center text-gray-500">{overallNotVisited}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Submission Prompt */}
          <div className="bg-amber-50 border border-amber-300 rounded p-4 text-center space-y-2">
            <p className="text-sm font-bold text-amber-900">
              Are you sure you want to submit the group?
            </p>
            <p className="text-xs text-amber-700">
              Once submitted, you will not be able to modify your responses.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#e9ecef] border-t border-[#ccc] px-4 py-3 flex items-center justify-center gap-4">
          <button
            onClick={onConfirmSubmit}
            className="bg-[#28a745] hover:bg-[#218838] active:bg-[#1e7e34] text-white px-8 py-2 rounded text-xs font-bold uppercase shadow-sm border border-[#1e7e34] cursor-pointer transition-all active:scale-95"
          >
            Yes (Submit)
          </button>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-2 rounded text-xs font-bold uppercase shadow-sm border border-[#ccc] cursor-pointer transition-all active:scale-95"
          >
            No (Continue Test)
          </button>
        </div>
      </div>
    </div>
  );
}

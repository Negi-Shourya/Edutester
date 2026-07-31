import { X } from 'lucide-react';

interface NtaInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NtaInstructionsModal({ isOpen, onClose }: NtaInstructionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded border-2 border-[#1b365d] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#1b365d] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#0f2444]">
          <h2 className="font-bold text-sm text-amber-300 uppercase tracking-wide">
            General Instructions - Computer Based Test (CBT)
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-gray-800 space-y-4 nta-scrollbar leading-relaxed">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-amber-900 rounded font-medium">
            Please read the instructions carefully before starting the examination.
          </div>

          <h3 className="font-bold text-sm text-[#1b365d] border-b pb-1">1. General Instructions:</h3>
          <ol className="list-decimal pl-5 space-y-1.5 text-gray-700">
            <li>Total duration of examination is 180 minutes (3 Hours).</li>
            <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
            <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
            <li>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:</li>
          </ol>

          {/* Palette Legend Explanation */}
          <div className="border border-gray-300 rounded p-3 bg-gray-50 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-7 h-6 font-bold text-xs flex items-center justify-center nta-shape-not-visited shrink-0">1</div>
              <span>You have not visited the question yet.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-6 font-bold text-xs flex items-center justify-center nta-shape-not-answered shrink-0">2</div>
              <span>You have not answered the question.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-6 font-bold text-xs flex items-center justify-center nta-shape-answered shrink-0">3</div>
              <span>You have answered the question.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-6 font-bold text-xs flex items-center justify-center nta-shape-marked shrink-0">4</div>
              <span>You have NOT answered the question, but have marked the question for review.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-6 font-bold text-xs flex items-center justify-center nta-shape-answered-marked shrink-0">5</div>
              <span>The question(s) <strong>&quot;Answered and Marked for Review&quot;</strong> will be considered for evaluation.</span>
            </div>
          </div>

          <h3 className="font-bold text-sm text-[#1b365d] border-b pb-1 pt-2">2. Navigating to a Question:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly.</li>
            <li>Click on <strong>Save &amp; Next</strong> to save your answer for the current question and then go to the next question.</li>
            <li>Click on <strong>Mark for Review &amp; Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
          </ul>

          <h3 className="font-bold text-sm text-[#1b365d] border-b pb-1 pt-2">3. Answering a Question:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>To select your answer, click on the button of one of the options.</li>
            <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button.</li>
            <li>To change your chosen answer, click on the button of another option.</li>
            <li>To save your answer, you MUST click on the <strong>Save &amp; Next</strong> button.</li>
          </ul>

          <h3 className="font-bold text-sm text-[#1b365d] border-b pb-1 pt-2">4. Marking Scheme:</h3>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-1 text-blue-900">
            <p><strong>Multiple Choice Questions (Section A):</strong> +4 for Correct Answer, -1 for Incorrect Answer, 0 for Unanswered.</p>
            <p><strong>Numerical Value Questions (Section B):</strong> +4 for Correct Answer, -1 for Incorrect Answer, 0 for Unanswered.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#e9ecef] border-t border-[#ccc] px-4 py-2.5 text-right">
          <button
            onClick={onClose}
            className="bg-[#337ab7] hover:bg-[#286090] text-white px-5 py-1.5 rounded text-xs font-bold uppercase cursor-pointer"
          >
            I Have Read &amp; Understood Instructions
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { User, FileText, HelpCircle, AlertTriangle, Clock } from 'lucide-react';

interface NtaHeaderProps {
  examName: string;
  candidateName: string;
  candidateId: string;
  timeLeft: number;
  onOpenQuestionPaper: () => void;
  onOpenInstructions: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  compact?: boolean;
  // 'jee' shows "JEE (Main) Computer Based Test", 'neet' shows
  // "NEET (UG) Computer Based Test" in the top banner.
  examType?: 'jee' | 'neet';
}

export default function NtaHeader({
  examName,
  candidateName,
  candidateId,
  timeLeft,
  onOpenQuestionPaper,
  onOpenInstructions,
  language,
  onLanguageChange,
  compact = false,
  examType = 'jee',
}: NtaHeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 300; // less than 5 mins

  return (
    <header className="nta-header bg-[#1b365d] text-white shrink-0 select-none border-b border-[#0d2242] shadow-md">
      {compact ? (
        /* Compact single-row header (phone landscape): candidate + timer only */
        <div className="flex items-center justify-between gap-2 px-2 sm:px-3 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-amber-100 border border-amber-400 text-[#1b365d] flex items-center justify-center font-bold text-[10px] shadow-inner shrink-0">
              <User className="w-3.5 h-3.5 text-[#1b365d]" />
            </div>
            <div className="text-left leading-tight min-w-0">
              <div className="text-[10px] sm:text-xs font-bold text-white truncate max-w-[30vw] sm:max-w-[35vw]">
                {candidateName}
              </div>
              <div className="text-[9px] text-amber-200 font-mono leading-none">
                Roll: {candidateId}
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[10px] sm:text-xs font-bold shrink-0 ${
              isLowTime
                ? 'bg-red-600 border-red-400 text-white animate-pulse'
                : 'bg-[#0f2444] border-amber-400/50 text-amber-300'
            }`}
          >
            {isLowTime ? (
              <AlertTriangle className="w-3 h-3 text-white" />
            ) : (
              <Clock className="w-3 h-3 text-amber-300" />
            )}
            <span className="text-[9px] font-normal text-gray-300 mr-0.5 hidden sm:inline">
              Time Left:
            </span>
            <span>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      ) : (
      <>
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#0f2444] text-xs border-b border-[#1b3b6b]">
        {/* Exam Logo & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center font-black text-[#1b365d] text-xs shadow-sm shrink-0">
            E
          </div>
          <div className="min-w-0">
            <h1 className="font-bold tracking-wide text-amber-300 text-[11px] sm:text-sm uppercase truncate">
              Edu Tester Exam
            </h1>
            <p className="text-[9px] sm:text-[10px] text-gray-300 leading-none truncate">
              {examType === 'neet' ? 'NEET (UG) Computer Based Test (CBT)' : 'JEE (Main) Computer Based Test (CBT)'}
            </p>
          </div>
        </div>

        {/* Action Controls: Question Paper, Instructions, Language */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenQuestionPaper}
            className="flex items-center gap-1 bg-[#1e447b] hover:bg-[#285799] text-white px-2 py-1.5 rounded text-[11px] sm:text-xs font-semibold border border-white/20 transition-all shadow-sm active:scale-95"
            title="View entire Question Paper"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Question Paper</span>
          </button>

          <button
            onClick={onOpenInstructions}
            className="flex items-center gap-1 bg-[#1e447b] hover:bg-[#285799] text-white px-2 py-1.5 rounded text-[11px] sm:text-xs font-semibold border border-white/20 transition-all shadow-sm active:scale-95"
            title="Read Official Instructions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Instructions</span>
          </button>

          <div className="flex items-center gap-1 bg-[#0a182d] px-1.5 sm:px-2 py-1 rounded border border-white/20 text-xs">
            <span className="text-[11px] text-gray-300 hidden sm:inline">Default Language:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold cursor-pointer outline-none text-[11px] sm:text-xs py-0.5"
            >
              <option value="English" className="bg-[#1b365d] text-white">English</option>
              <option value="Hindi" className="bg-[#1b365d] text-white">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub Header: Exam Title & Candidate Info + Clock */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#1b365d]">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="text-[10px] sm:text-xs min-w-0">
            <span className="text-gray-300 font-medium hidden sm:inline">Exam Name: </span>
            <span className="font-bold text-white uppercase truncate block sm:inline max-w-[34vw] sm:max-w-none">
              {examName}
            </span>
          </div>
          <div className="text-xs hidden md:block border-l border-white/20 pl-3">
            <span className="text-gray-300 font-medium">Paper: </span>
            <span className="font-semibold text-amber-200">B.E./B.Tech. (Paper 1)</span>
          </div>
        </div>

        {/* Right Candidate Details & Countdown Clock */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Candidate Card (name hidden on very small screens) */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-amber-100 border border-amber-400 text-[#1b365d] flex items-center justify-center font-bold text-xs shadow-inner">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1b365d]" />
            </div>
            <div className="text-left text-[10px] sm:text-xs leading-tight hidden sm:block">
              <div className="font-bold text-white truncate max-w-[130px]">{candidateName}</div>
              <div className="text-[10px] text-amber-200 font-mono">Roll: {candidateId}</div>
            </div>
          </div>

          {/* Time Remaining Clock */}
          <div
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded border font-mono text-xs sm:text-sm font-bold shadow-inner ${
              isLowTime
                ? 'bg-red-600 border-red-400 text-white animate-pulse'
                : 'bg-[#0f2444] border-amber-400/50 text-amber-300'
            }`}
          >
            {isLowTime ? (
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            ) : (
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            )}
            <span className="text-[10px] sm:text-xs font-normal text-gray-300 mr-0.5 sm:mr-1">
              Time Left:
            </span>
            <span>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-gray-800 rounded border-2 border-[#1b365d] max-w-sm w-full p-4 shadow-2xl">
            <h3 className="font-bold text-[#1b365d] border-b pb-2 mb-3 text-sm uppercase">Candidate Profile</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Candidate Name:</span> <span className="font-bold">{candidateName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Roll No.:</span> <span className="font-bold font-mono">{candidateId}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Subject:</span> <span className="font-bold">JEE (Main) Mock Test</span></div>
              <div className="flex justify-between"><span className="text-gray-500">System Name:</span> <span className="font-bold font-mono text-blue-700">C001</span></div>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="mt-4 w-full py-1.5 bg-[#1b365d] text-white rounded text-xs font-bold hover:bg-[#0f2444]"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
      </>
      )}
    </header>
  );
}

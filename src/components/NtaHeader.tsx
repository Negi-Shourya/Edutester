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
}: NtaHeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 300; // less than 5 mins

  return (
    <header className="bg-[#1b365d] text-white shrink-0 select-none border-b border-[#0d2242] shadow-md">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0f2444] text-xs border-b border-[#1b3b6b]">
        {/* Exam Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center font-black text-[#1b365d] text-xs shadow-sm">
            E
          </div>
          <div>
            <h1 className="font-bold tracking-wide text-amber-300 text-xs sm:text-sm uppercase">
              Edu Tester Exam
            </h1>
            <p className="text-[10px] text-gray-300 leading-none">
              JEE (Main) Computer Based Test (CBT)
            </p>
          </div>
        </div>

        {/* Action Controls: Question Paper, Instructions, Language */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuestionPaper}
            className="flex items-center gap-1 bg-[#1e447b] hover:bg-[#285799] text-white px-2.5 py-1 rounded text-xs font-semibold border border-white/20 transition-all shadow-sm active:scale-95"
            title="View entire Question Paper"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Question Paper</span>
          </button>

          <button
            onClick={onOpenInstructions}
            className="flex items-center gap-1 bg-[#1e447b] hover:bg-[#285799] text-white px-2.5 py-1 rounded text-xs font-semibold border border-white/20 transition-all shadow-sm active:scale-95"
            title="Read Official Instructions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>Instructions</span>
          </button>

          <div className="flex items-center gap-1 bg-[#0a182d] px-2 py-0.5 rounded border border-white/20 text-xs">
            <span className="text-[11px] text-gray-300">Default Language:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-amber-300 font-semibold cursor-pointer outline-none text-xs"
            >
              <option value="English" className="bg-[#1b365d] text-white">English</option>
              <option value="Hindi" className="bg-[#1b365d] text-white">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub Header: Exam Title & Candidate Info + Clock */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1b365d]">
        <div className="flex items-center gap-4">
          <div className="text-xs">
            <span className="text-gray-300 font-medium">Exam Name: </span>
            <span className="font-bold text-white uppercase">{examName}</span>
          </div>
          <div className="text-xs hidden md:block border-l border-white/20 pl-3">
            <span className="text-gray-300 font-medium">Paper: </span>
            <span className="font-semibold text-amber-200">B.E./B.Tech. (Paper 1)</span>
          </div>
        </div>

        {/* Right Candidate Details & Countdown Clock */}
        <div className="flex items-center gap-4">
          {/* Candidate Card */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-100 border border-amber-400 text-[#1b365d] flex items-center justify-center font-bold text-xs shadow-inner">
              <User className="w-4 h-4 text-[#1b365d]" />
            </div>
            <div className="text-left text-xs leading-tight">
              <div className="font-bold text-white truncate max-w-[130px]">{candidateName}</div>
              <div className="text-[10px] text-amber-200 font-mono">Roll: {candidateId}</div>
            </div>
          </div>

          {/* Time Remaining Clock */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded border font-mono text-sm font-bold shadow-inner ${
              isLowTime
                ? 'bg-red-600 border-red-400 text-white animate-pulse'
                : 'bg-[#0f2444] border-amber-400/50 text-amber-300'
            }`}
          >
            {isLowTime ? (
              <AlertTriangle className="w-4 h-4 text-white" />
            ) : (
              <Clock className="w-4 h-4 text-amber-300" />
            )}
            <span className="text-xs font-normal text-gray-300 mr-1">Time Left:</span>
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
    </header>
  );
}

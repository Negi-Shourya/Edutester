// A stylized, non-interactive preview of the NTA test screen — the most
// characteristic thing in EduTester's world. Replaces the question palette
// as the hero visual: it shows the actual exam interface (header, timer,
// question, options) instead of an abstract motif.

import { Clock } from 'lucide-react';

const SAMPLE_OPTIONS = [
  { label: 'A', text: '2 m/s²', answered: true },
  { label: 'B', text: '4 m/s²', answered: false },
  { label: 'C', text: '6 m/s²', answered: false },
  { label: 'D', text: '8 m/s²', answered: false },
];

const SAMPLE_TABS = ['Physics', 'Chemistry', 'Mathematics'];

export default function ExamScreenPreview() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Ambient glow behind the screen */}
      <div className="absolute -inset-6 bg-gradient-to-br from-primary/15 via-saffron/10 to-primary/15 rounded-[2rem] blur-2xl" />

      {/* The exam screen */}
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-primary/15 overflow-hidden animate-float">
        {/* NTA-style header */}
        <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-amber-100 border border-amber-400 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
              E
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[11px] font-bold truncate">Aarav Sharma</div>
              <div className="text-[9px] text-amber-200 font-mono">Roll: 2401234567</div>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[11px] font-bold bg-primary-dark border-amber-400/50 text-amber-300 shrink-0">
            <Clock className="w-3 h-3" /> 02:41:36
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 px-3 py-2 bg-primary-dark/90">
          {SAMPLE_TABS.map((tab, i) => (
            <span
              key={tab}
              className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wide ${
                i === 0 ? 'bg-white text-primary shadow-sm' : 'bg-white/10 text-white/80'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Question body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
              Q. 14
            </span>
            <span className="font-mono text-[10px] text-gray-400">+4 / −1</span>
          </div>
          <p className="text-[13px] text-gray-800 leading-relaxed mb-3.5">
            A body of mass 2 kg moves with a constant velocity of 5 m/s under a
            force of 10 N. The acceleration of the body is…
          </p>
          <div className="space-y-1.5">
            {SAMPLE_OPTIONS.map((opt) => (
              <div
                key={opt.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[12px] transition-colors ${
                  opt.answered
                    ? 'border-green-500 bg-green-50 text-gray-900'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    opt.answered ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}
                >
                  {opt.answered && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="font-mono text-[10px] font-bold text-gray-400">{opt.label}.</span>
                {opt.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-end gap-2 bg-gray-50">
          <span className="text-[10px] font-mono text-gray-400 mr-auto">Section A · 25 Qs</span>
          <span className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-[10px] font-bold">
            Save & Next
          </span>
        </div>
      </div>

      {/* Small palette legend chip — the palette lives here now, quietly */}
      <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] nta-shape-answered" /> 12</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] nta-shape-not-answered" /> 3</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] nta-shape-marked" /> 2</span>
        <span className="text-gray-300">|</span>
        <span className="font-mono tracking-widest uppercase">the real NTA interface</span>
      </div>
    </div>
  );
}

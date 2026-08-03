// The signature motif of EduTester: the NTA question palette, rendered as a
// decorative "answer sheet" panel. Used in the hero and marketing pages so
// the exam experience is the first thing a visitor recognizes.

const TILE_STATES = ['not-visited', 'answered', 'not-answered', 'marked', 'answered'] as const;

// Deterministic pseudo-random layout so the panel looks organic but never
// changes between renders.
function tileState(index: number): (typeof TILE_STATES)[number] {
  const pattern = [0, 3, 1, 2, 4, 1, 3, 0, 2, 1, 4, 3, 1, 2, 0, 3, 1, 4, 2, 1, 3, 0, 1, 2, 4];
  return TILE_STATES[pattern[index % pattern.length]];
}

export default function PaletteSignature({ rows = 5, cols = 9 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-primary/10 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
              Question Palette
            </span>
          </div>
          <span className="font-mono text-[10px] text-gray-400">JEE (Main) · CBT</span>
        </div>

        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: rows * cols }, (_, i) => {
            const state = tileState(i);
            const cls =
              state === 'answered'
                ? 'nta-shape-answered'
                : state === 'not-answered'
                  ? 'nta-shape-not-answered'
                  : state === 'marked'
                    ? 'nta-shape-marked'
                    : 'nta-shape-not-visited';
            return <div key={i} className={`aspect-square ${cls}`} />;
          })}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[2px] nta-shape-answered" /> Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[2px] nta-shape-not-answered" /> Not Answered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[2px] nta-shape-marked" /> Marked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[2px] nta-shape-not-visited" /> Not Visited
          </span>
        </div>
      </div>
    </div>
  );
}

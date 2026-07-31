import { useEffect, useState } from 'react';
import { ExternalLink, Clock, Sunrise, Sunset } from 'lucide-react';
import { getPapers } from '../data/questions';

interface PaperEntry {
  date: string;
  day: string;
  shift: 'Shift 1 (Morning)' | 'Shift 2 (Evening)';
  time: string;
  paper: string;
  link: string;
}

interface SessionGroup {
  id: string;
  label: string;
  subtitle: string;
  accent: string;
  badge: string;
  papers: PaperEntry[];
}

const jan2026Papers: PaperEntry[] = [
  { date: '21 Jan 2026', day: 'Wednesday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '21 Jan 2026', day: 'Wednesday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '22 Jan 2026', day: 'Thursday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '22 Jan 2026', day: 'Thursday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '23 Jan 2026', day: 'Friday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '23 Jan 2026', day: 'Friday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '24 Jan 2026', day: 'Saturday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '24 Jan 2026', day: 'Saturday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '28 Jan 2026', day: 'Wednesday', shift: 'Shift 1 (Morning)', time: '9:00 AM – 12:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
  { date: '28 Jan 2026', day: 'Wednesday', shift: 'Shift 2 (Evening)', time: '3:00 PM – 6:00 PM', paper: 'B.E./B.Tech. (Paper 1)', link: '/test' },
];

const comingSoon = [
  { year: 2025, label: '2025' },
  { year: 2024, label: '2024' },
  { year: 2023, label: '2023' },
];

function groupByDate(papers: PaperEntry[]) {
  const groups: Record<string, PaperEntry[]> = {};
  for (const p of papers) {
    if (!groups[p.date]) groups[p.date] = [];
    groups[p.date].push(p);
  }
  return groups;
}

export default function PaperTests() {
  const [expanded, setExpanded] = useState<string>('apr-2026');
  const [papersLoading, setPapersLoading] = useState(true);
  const [papersError, setPapersError] = useState<string | null>(null);
  const [apr2026Papers, setApr2026Papers] = useState<PaperEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPapers()
      .then((papers) => {
        if (cancelled) return;
        const entries: PaperEntry[] = papers.map((p) => {
          const date = new Date(`${p.examDate}T00:00:00`);
          const isMorning = p.session === 'morning';
          return {
            date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            day: date.toLocaleDateString('en-US', { weekday: 'long' }),
            shift: isMorning ? 'Shift 1 (Morning)' : 'Shift 2 (Evening)',
            time: isMorning ? '9:00 AM – 12:00 PM' : '3:00 PM – 6:00 PM',
            paper: 'B.E./B.Tech. (Paper 1)',
            link: `/test?paper=${p.key}`,
          };
        });
        setApr2026Papers(entries);
      })
      .catch((err: unknown) => {
        if (!cancelled) setPapersError(err instanceof Error ? err.message : 'Failed to load papers.');
      })
      .finally(() => {
        if (!cancelled) setPapersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sessions: SessionGroup[] = [
    {
      id: 'apr-2026',
      label: 'April 2026',
      subtitle: 'Session 2',
      accent: 'from-amber-50 to-orange-50',
      badge: 'Session 2',
      papers: apr2026Papers,
    },
    {
      id: 'jan-2026',
      label: 'January 2026',
      subtitle: 'Session 1',
      accent: 'from-sky-50 to-blue-50',
      badge: 'Session 1',
      papers: jan2026Papers,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-stone-200 px-4 py-1.5 rounded-full text-sm text-stone-500 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            JEE Main 2026 papers now available
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-stone-800 tracking-tight">
            Paper-wise Tests
          </h1>
          <p className="text-stone-400 mt-2 max-w-md mx-auto">
            Practice with actual JEE Main question papers, one shift at a time.
          </p>
        </div>

        {/* Session List */}
        <div className="space-y-6">
          {sessions.map((session) => {
            const isOpen = expanded === session.id;
            const groups = groupByDate(session.papers);

            return (
              <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                {/* Session Header */}
                <button
                  onClick={() => setExpanded(isOpen ? '' : session.id)}
                  className={`w-full flex items-center justify-between px-6 py-5 transition-colors ${
                    isOpen ? 'border-b border-stone-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${session.accent} flex items-center justify-center`}>
                      <span className="text-sm font-semibold text-stone-700">
                        {session.label === 'April 2026' ? 'A' : 'J'}
                      </span>
                    </div>
                    <div className="text-left">
                      <h2 className="text-base font-medium text-stone-800">{session.label}</h2>
                      <p className="text-xs text-stone-400">{session.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {papersLoading && session.id === 'apr-2026' && (
                      <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
                        Loading…
                      </span>
                    )}
                    {!papersLoading && (
                      <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full">
                        {session.papers.length} shifts
                      </span>
                    )}
                    <div className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Papers */}
                {isOpen && (
                  <div className="px-6 py-4 space-y-3">
                    {papersError && session.id === 'apr-2026' && (
                      <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        {papersError}
                      </div>
                    )}
                    {Object.entries(groups).map(([date, entries]) => (
                      <div key={date} className="border border-stone-100 rounded-xl overflow-hidden">
                        <div className="bg-stone-50/80 px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-medium text-stone-700">{date}</span>
                            <span className="text-xs text-stone-400 bg-white px-2 py-0.5 rounded-full">{entries[0].day}</span>
                          </div>
                          <span className="text-xs text-stone-400">{entries.length} shift{entries.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="divide-y divide-stone-50">
                          {entries.map((entry, i) => {
                            const isMorning = entry.shift === 'Shift 1 (Morning)';
                            return (
                              <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-stone-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isMorning ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-500'
                                  }`}>
                                    {isMorning ? <Sunrise className="w-4 h-4" /> : <Sunset className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <div className="text-sm text-stone-700">{entry.shift}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <Clock className="w-3 h-3 text-stone-300" />
                                      <span className="text-xs text-stone-400">{entry.time}</span>
                                    </div>
                                  </div>
                                </div>
                                <a
                                  href={entry.link}
                                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                                >
                                  Attempt
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-stone-400 mb-3 text-center">Previous Years</h3>
          <div className="grid grid-cols-3 gap-3">
            {comingSoon.map((y) => (
              <div key={y.year} className="bg-white rounded-xl border border-stone-100 p-5 text-center shadow-sm">
                <div className="text-xl font-light text-stone-300 mb-1">{y.year}</div>
                <span className="text-xs text-stone-300 bg-stone-50 px-3 py-1 rounded-full">Coming Soon</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-300">
            Placeholder links &middot; Actual papers will be added as they become available.
          </p>
        </div>
      </div>
    </div>
  );
}

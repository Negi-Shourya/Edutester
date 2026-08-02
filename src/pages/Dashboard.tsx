import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, FileText, TrendingUp, Clock, BarChart3, Target,
  ArrowRight, Play, AlertCircle, LineChart, Award, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAttempts, backfillLocalAttempts, type AttemptRow } from '../lib/attemptsDb';

const SECTION_COLORS: Record<string, string> = {
  Physics: 'bg-blue-500',
  Chemistry: 'bg-green-500',
  Mathematics: 'bg-purple-500',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

interface SubjectStat {
  section: string;
  attempts: number;
  avgScorePct: number;
  avgAccuracy: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Push any pre-sync local attempts to the DB before loading (idempotent).
      await backfillLocalAttempts();
      if (cancelled) return;
      const rows = await getAttempts();
      if (!cancelled) setAttempts(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const rows = attempts ?? [];
    const n = rows.length;
    const avgAccuracy = n > 0 ? Math.round(rows.reduce((s, r) => s + r.accuracy, 0) / n) : 0;
    const avgScorePct =
      n > 0
        ? Math.round(
            rows.reduce((s, r) => s + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0), 0) /
              n
          )
        : 0;
    const best = rows.reduce<AttemptRow | null>(
      (b, r) => (b === null || r.max_score > 0 && (r.total_score / r.max_score) > (b.max_score > 0 ? b.total_score / b.max_score : 0) ? r : b),
      null
    );
    const bestPct = best && best.max_score > 0 ? Math.round((best.total_score / best.max_score) * 100) : 0;
    const timePracticed = rows.reduce((s, r) => s + r.time_spent, 0);
    return { n, avgAccuracy, avgScorePct, bestPct, timePracticed };
  }, [attempts]);

  const subjects = useMemo<SubjectStat[]>(() => {
    const rows = attempts ?? [];
    const bySection = new Map<string, SubjectStat>();
    for (const row of rows) {
      for (const sec of row.section_breakdown ?? []) {
        const cur = bySection.get(sec.section) ?? {
          section: sec.section,
          attempts: 0,
          avgScorePct: 0,
          avgAccuracy: 0,
        };
        cur.attempts++;
        bySection.set(sec.section, cur);
      }
    }
    const result: SubjectStat[] = [];
    for (const cur of bySection.values()) {
      let scoreSum = 0;
      let accSum = 0;
      for (const row of rows) {
        const sec = (row.section_breakdown ?? []).find((s) => s.section === cur.section);
        if (sec) {
          scoreSum += sec.max_score > 0 ? (sec.score / sec.max_score) * 100 : 0;
          accSum += sec.accuracy;
        }
      }
      result.push({
        ...cur,
        avgScorePct: Math.round(scoreSum / cur.attempts),
        avgAccuracy: Math.round(accSum / cur.attempts),
      });
    }
    return result.sort((a, b) => b.avgScorePct - a.avgScorePct);
  }, [attempts]);

  const weakAreas = useMemo(() => {
    const weak = subjects.filter((s) => s.avgAccuracy < 70);
    return weak.length > 0 ? weak : subjects.slice(0, 1);
  }, [subjects]);

  const loading = attempts === null;
  const rows = attempts ?? [];
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Your performance, at a glance
            </p>
          </div>
          <Link
            to="/paper-tests"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
          >
            <Play className="w-4 h-4 fill-current" />
            Take a Test
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Loading your dashboard…</p>
          </div>
        ) : rows.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No tests taken yet</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Attempt your first full paper or chapter test and your results,
              subject-wise breakdown, and improvement areas will show up here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/paper-tests"
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                <FileText className="w-4 h-4" /> Paper-wise Tests
              </Link>
              <Link
                to="/chapter-tests"
                className="flex items-center justify-center gap-2 bg-indigo-50 text-primary px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Chapter Tests
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<BookOpen className="w-5 h-5 text-white" />}
                color="from-blue-500 to-blue-600"
                value={String(stats.n)}
                label="Tests Taken"
                sub="total submissions"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-white" />}
                color="from-green-500 to-green-600"
                value={`${stats.avgScorePct}%`}
                label="Avg. Score"
                sub="across all tests"
              />
              <StatCard
                icon={<Award className="w-5 h-5 text-white" />}
                color="from-purple-500 to-purple-600"
                value={`${stats.bestPct}%`}
                label="Best Score"
                sub="single test"
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-white" />}
                color="from-orange-500 to-orange-600"
                value={formatDuration(stats.timePracticed)}
                label="Time Practiced"
                sub={`${stats.avgAccuracy}% avg. accuracy`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-6">

                {/* Subject-wise performance */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Subject Performance
                    </h2>
                    <Link to="/chapter-tests" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                      Practice <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {subjects.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">
                      Subject breakdown will appear after your first submission.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {subjects.map((sub) => {
                        const color = SECTION_COLORS[sub.section] ?? 'bg-gray-500';
                        return (
                          <div key={sub.section}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-gray-700">{sub.section}</span>
                              <span className="text-xs text-gray-400">
                                {sub.attempts} {sub.attempts === 1 ? 'test' : 'tests'} · {sub.avgScorePct}% score · {sub.avgAccuracy}% accuracy
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div
                                className={`${color} h-2.5 rounded-full transition-all`}
                                style={{ width: `${sub.avgScorePct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Score trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-primary" />
                      Score Trend
                    </h2>
                    <span className="text-xs text-gray-400">last {Math.min(rows.length, 10)} tests</span>
                  </div>
                  <div className="flex items-end gap-2 sm:gap-3 h-40">
                    {rows.slice(0, 10).reverse().map((row) => {
                      const pct = row.max_score > 0 ? (row.total_score / row.max_score) * 100 : 0;
                      return (
                        <div key={row.id} className="flex-1 flex flex-col items-center gap-1.5 min-w-0" title={`${row.title}\n${row.total_score}/${row.max_score} (${Math.round(pct)}%)`}>
                          <span className={`text-[10px] font-semibold ${pct >= 60 ? 'text-green-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                            {Math.round(pct)}%
                          </span>
                          <div className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-primary to-purple-500 transition-all" style={{ height: `${Math.max(pct, 3)}%` }} />
                          <span className="text-[10px] text-gray-400 truncate w-full text-center">
                            {formatDate(row.created_at)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Test history */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Test History
                    </h2>
                    <span className="text-xs text-gray-400">{rows.length} total</span>
                  </div>
                  <div className="space-y-3">
                    {rows.map((row) => {
                      const pct = row.max_score > 0 ? Math.round((row.total_score / row.max_score) * 100) : 0;
                      return (
                        <div key={row.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all">
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{row.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatDate(row.created_at)} · {row.correct} correct · {row.incorrect} wrong · {row.unattempted} skipped
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-gray-900">
                                {row.total_score}<span className="text-sm text-gray-400 font-normal">/{row.max_score}</span>
                              </div>
                              <div className={`text-xs font-medium ${pct >= 60 ? 'text-green-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                                {pct}%
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(row.section_breakdown ?? []).map((sec) => (
                              <span
                                key={sec.section}
                                className={`text-xs px-2 py-1 rounded-md font-medium ${
                                  sec.accuracy >= 70
                                    ? 'bg-green-50 text-green-700'
                                    : sec.accuracy >= 40
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {sec.section}: {sec.score}/{sec.max_score} ({sec.accuracy}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                {/* Quick actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/chapter-tests" className="flex flex-col items-center gap-2 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all group">
                      <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">Chapter</span>
                    </Link>
                    <Link to="/paper-tests" className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all group">
                      <FileText className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">Full Paper</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all group">
                      <Award className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">My Plan</span>
                    </Link>
                    <Link to="/pricing" className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all group">
                      <ArrowRight className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">Upgrade</span>
                    </Link>
                  </div>
                </div>

                {/* Focus / weak areas */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Focus Areas
                  </h2>
                  {weakAreas.length === 0 ? (
                    <p className="text-sm text-gray-500">No data yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {weakAreas.map((sub) => (
                        <div key={sub.section}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-900 font-medium">{sub.section}</span>
                            <span className="text-red-500 font-medium text-xs">{sub.avgAccuracy}% accuracy</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1.5">
                            {sub.avgAccuracy < 70
                              ? `Needs practice — below your usual accuracy`
                              : 'Keep improving — most consistent subject'}
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${sub.avgAccuracy < 50 ? 'bg-red-400' : sub.avgAccuracy < 70 ? 'bg-amber-400' : 'bg-green-400'}`}
                              style={{ width: `${sub.avgAccuracy}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Link to="/chapter-tests" className="flex items-center justify-center gap-1 mt-4 text-sm text-primary font-medium py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    Practice Weak Topics <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Subscription CTA */}
                <div className="bg-gradient-to-br from-primary to-purple-600 rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-1.5">Unlock every paper</h3>
                  <p className="text-indigo-100 text-xs mb-4 leading-relaxed">
                    Get access to all chapter tests, full papers, and the complete test series.
                  </p>
                  <Link to="/pricing" className="flex items-center justify-center gap-1.5 bg-white text-primary px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition-colors">
                    View Plans <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, color, value, label, sub }: {
  icon: React.ReactNode;
  color: string;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

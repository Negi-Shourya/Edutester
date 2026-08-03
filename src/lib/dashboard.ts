import type { AttemptRow } from './attemptsDb';
import { getPaperQuestions } from '../data/questions';

export interface QuestionMeta {
  id: number;
  section: string;
  type: 'mcq' | 'numerical';
  marks: number;
  negativeMarks: number;
}

export interface SectionPerformance {
  section: string;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  scorePct: number;
}

export interface TestInsight {
  kind: 'positive' | 'warning' | 'danger';
  text: string;
}

export interface TestAnalysis {
  row: AttemptRow;
  scorePct: number;
  sections: SectionPerformance[];
  mcq: { attempted: number; correct: number; accuracy: number | null };
  numerical: { attempted: number; correct: number; accuracy: number | null };
  marksLeftOnTable: number;
  negativeLoss: number;
  insights: TestInsight[];
}

export interface SubjectOverall {
  section: string;
  attempts: number;
  avgScorePct: number;
  avgAccuracy: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  recentAccuracy: number | null;
  previousAccuracy: number | null;
  trend: 'up' | 'down' | 'flat';
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  ctaLabel: string;
  ctaTo: string;
}

export interface OverallAnalysis {
  subjects: SubjectOverall[];
  mcqAccuracy: number | null;
  numericalAccuracy: number | null;
  unattemptedRate: number;
  accuracy: number;
  recommendations: Recommendation[];
}

// Loads question metadata (section, type, marks) for every paper the user
// attempted. Used to turn per-question outcomes into real insights.
export async function loadQuestionMeta(
  attempts: AttemptRow[]
): Promise<Map<string, QuestionMeta[]>> {
  const keys = [...new Set(attempts.map((a) => a.paper_key))];
  const meta = new Map<string, QuestionMeta[]>();
  await Promise.all(
    keys.map(async (key) => {
      try {
        const { questions } = await getPaperQuestions(key);
        meta.set(
          key,
          questions.map((q) => ({
            id: q.id,
            section: q.section,
            type: q.type === 'numerical' ? 'numerical' : 'mcq',
            marks: q.marks ?? 4,
            negativeMarks: Math.abs(q.negativeMarks ?? -1),
          }))
        );
      } catch {
        // Question bank unavailable — analysis falls back to aggregates.
      }
    })
  );
  return meta;
}

export function analyzeTest(row: AttemptRow, questions?: QuestionMeta[]): TestAnalysis {
  const scorePct = row.max_score > 0 ? Math.round((row.total_score / row.max_score) * 100) : 0;
  const sections: SectionPerformance[] = (row.section_breakdown ?? []).map((s) => ({
    section: s.section,
    score: s.score,
    maxScore: s.max_score,
    correct: s.correct,
    incorrect: s.incorrect,
    unattempted: s.unattempted,
    accuracy: s.accuracy,
    scorePct: s.max_score > 0 ? Math.round((s.score / s.max_score) * 100) : 0,
  }));

  const outcomes = row.question_outcomes ?? {};
  const byType = { mcq: { attempted: 0, correct: 0 }, numerical: { attempted: 0, correct: 0 } };
  let marksLeftOnTable = 0;
  let negativeLoss = 0;
  if (questions && questions.length > 0) {
    const byId = new Map(questions.map((q) => [String(q.id), q]));
    for (const [id, outcome] of Object.entries(outcomes)) {
      const q = byId.get(id);
      if (!q) continue;
      const bucket = q.type === 'numerical' ? byType.numerical : byType.mcq;
      if (outcome === 'correct') {
        bucket.attempted++;
        bucket.correct++;
      } else if (outcome === 'incorrect') {
        bucket.attempted++;
        negativeLoss += q.negativeMarks;
      } else {
        marksLeftOnTable += q.marks;
      }
    }
  }
  // Fallbacks when question metadata is unavailable.
  if (negativeLoss === 0) negativeLoss = row.incorrect;
  if (marksLeftOnTable === 0) marksLeftOnTable = row.unattempted * 4;

  const mcqAccuracy =
    byType.mcq.attempted > 0 ? Math.round((byType.mcq.correct / byType.mcq.attempted) * 100) : null;
  const numericalAccuracy =
    byType.numerical.attempted > 0
      ? Math.round((byType.numerical.correct / byType.numerical.attempted) * 100)
      : null;

  const insights: TestInsight[] = [];

  if (scorePct >= 60) {
    insights.push({ kind: 'positive', text: `Solid performance — scored ${scorePct}% overall.` });
  } else if (scorePct >= 40) {
    insights.push({
      kind: 'warning',
      text: `Moderate performance — ${scorePct}% overall. A few sections pulled the score down.`,
    });
  } else {
    insights.push({
      kind: 'danger',
      text: `Tough test — ${scorePct}% overall. Revise fundamentals before retaking.`,
    });
  }

  if (row.incorrect > 0) {
    insights.push({
      kind: row.incorrect >= 10 ? 'danger' : 'warning',
      text:
        row.incorrect >= 10
          ? `${row.incorrect} wrong answers cost you ${negativeLoss} marks. Slow down and re-check before answering.`
          : `${row.incorrect} wrong answers cost you ${negativeLoss} marks. One careful check could save several.`,
    });
  }

  if (row.unattempted > 0) {
    insights.push({
      kind: row.unattempted >= 15 ? 'warning' : 'positive',
      text:
        row.unattempted >= 15
          ? `${row.unattempted} questions left unattempted (${marksLeftOnTable} marks available). Manage time better to reach the easy ones.`
          : `${row.unattempted} questions left unattempted — worth up to ${marksLeftOnTable} marks.`,
    });
  }

  if (sections.length > 0) {
    const weakest = [...sections].sort((a, b) => a.accuracy - b.accuracy)[0];
    const strongest = [...sections].sort((a, b) => b.accuracy - a.accuracy)[0];
    if (weakest && weakest.accuracy < 60) {
      insights.push({
        kind: 'danger',
        text: `${weakest.section} was your weak spot — ${weakest.accuracy}% accuracy (${weakest.score}/${weakest.maxScore} marks).`,
      });
    } else if (strongest) {
      insights.push({
        kind: 'positive',
        text: `Balanced across sections — best in ${strongest.section} at ${strongest.accuracy}% accuracy.`,
      });
    }
  }

  if (mcqAccuracy !== null && numericalAccuracy !== null) {
    if (numericalAccuracy < mcqAccuracy - 10) {
      insights.push({
        kind: 'warning',
        text: `Numericals were harder than MCQs — ${numericalAccuracy}% vs ${mcqAccuracy}% accuracy.`,
      });
    } else if (mcqAccuracy < numericalAccuracy - 10) {
      insights.push({
        kind: 'warning',
        text: `MCQs tripped you up — ${mcqAccuracy}% vs ${numericalAccuracy}% accuracy on numericals.`,
      });
    }
  } else if (mcqAccuracy !== null && mcqAccuracy < 60) {
    insights.push({
      kind: 'warning',
      text: `MCQ accuracy was only ${mcqAccuracy}% — be careful with negative marking.`,
    });
  }

  return {
    row,
    scorePct,
    sections,
    mcq: { ...byType.mcq, accuracy: mcqAccuracy },
    numerical: { ...byType.numerical, accuracy: numericalAccuracy },
    marksLeftOnTable,
    negativeLoss,
    insights,
  };
}

export function analyzeOverall(
  rows: AttemptRow[],
  analyses: TestAnalysis[]
): OverallAnalysis {
  const subjects = computeSubjectTrends(rows);

  let mcqAttempted = 0;
  let mcqCorrect = 0;
  let numAttempted = 0;
  let numCorrect = 0;
  for (const a of analyses) {
    mcqAttempted += a.mcq.attempted;
    mcqCorrect += a.mcq.correct;
    numAttempted += a.numerical.attempted;
    numCorrect += a.numerical.correct;
  }
  const mcqAccuracy =
    mcqAttempted > 0 ? Math.round((mcqCorrect / mcqAttempted) * 100) : null;
  const numericalAccuracy =
    numAttempted > 0 ? Math.round((numCorrect / numAttempted) * 100) : null;

  const totalQuestions = rows.reduce((s, r) => s + r.correct + r.incorrect + r.unattempted, 0);
  const totalUnattempted = rows.reduce((s, r) => s + r.unattempted, 0);
  const unattemptedRate =
    totalQuestions > 0 ? Math.round((totalUnattempted / totalQuestions) * 100) : 0;

  const totalCorrect = rows.reduce((s, r) => s + r.correct, 0);
  const totalAttempted = rows.reduce((s, r) => s + r.correct + r.incorrect, 0);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return {
    subjects,
    mcqAccuracy,
    numericalAccuracy,
    unattemptedRate,
    accuracy,
    recommendations: buildRecommendations(subjects, {
      mcqAccuracy,
      numericalAccuracy,
      unattemptedRate,
      accuracy,
    }),
  };
}

function computeSubjectTrends(rows: AttemptRow[]): SubjectOverall[] {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const half = Math.max(1, Math.floor(sorted.length / 2));
  const recent = sorted.slice(-half);
  const previous = sorted.slice(0, Math.max(0, sorted.length - half));

  const bySection = new Map<string, SubjectOverall>();
  for (const row of sorted) {
    for (const sec of row.section_breakdown ?? []) {
      const cur = bySection.get(sec.section) ?? {
        section: sec.section,
        attempts: 0,
        avgScorePct: 0,
        avgAccuracy: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalUnattempted: 0,
        recentAccuracy: null,
        previousAccuracy: null,
        trend: 'flat' as const,
      };
      cur.attempts++;
      cur.totalCorrect += sec.correct;
      cur.totalIncorrect += sec.incorrect;
      cur.totalUnattempted += sec.unattempted;
      bySection.set(sec.section, cur);
    }
  }

  const avgOf = (list: AttemptRow[], section: string, key: 'correct' | 'incorrect'): number => {
    let attempted = 0;
    let correct = 0;
    for (const row of list) {
      const sec = (row.section_breakdown ?? []).find((s) => s.section === section);
      if (sec) {
        attempted += sec.correct + sec.incorrect;
        correct += key === 'correct' ? sec.correct : sec.incorrect;
      }
    }
    return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  };

  const result: SubjectOverall[] = [];
  for (const cur of bySection.values()) {
    let scoreSum = 0;
    let accSum = 0;
    for (const row of sorted) {
      const sec = (row.section_breakdown ?? []).find((s) => s.section === cur.section);
      if (sec) {
        scoreSum += sec.max_score > 0 ? (sec.score / sec.max_score) * 100 : 0;
        accSum += sec.accuracy;
      }
    }
    const recentAcc = avgOf(recent, cur.section, 'correct');
    const previousAcc = avgOf(previous, cur.section, 'correct');
    const hasRecent = recent.some((r) =>
      (r.section_breakdown ?? []).some((s) => s.section === cur.section)
    );
    const hasPrevious = previous.some((r) =>
      (r.section_breakdown ?? []).some((s) => s.section === cur.section)
    );
    const trend =
      !hasRecent || !hasPrevious
        ? 'flat'
        : recentAcc >= previousAcc + 5
          ? 'up'
          : recentAcc <= previousAcc - 5
            ? 'down'
            : 'flat';

    result.push({
      ...cur,
      avgScorePct: Math.round(scoreSum / cur.attempts),
      avgAccuracy: Math.round(accSum / cur.attempts),
      recentAccuracy: hasRecent ? recentAcc : null,
      previousAccuracy: hasPrevious ? previousAcc : null,
      trend,
    });
  }
  return result.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
}

function buildRecommendations(
  subjects: SubjectOverall[],
  overall: {
    mcqAccuracy: number | null;
    numericalAccuracy: number | null;
    unattemptedRate: number;
    accuracy: number;
  }
): Recommendation[] {
  const recs: Recommendation[] = [];

  const weak = [...subjects]
    .filter((s) => s.avgAccuracy < 60 || s.avgScorePct < 40)
    .sort((a, b) => a.avgAccuracy - b.avgAccuracy);

  for (const s of weak) {
    recs.push({
      priority: s.avgAccuracy < 45 ? 'high' : 'medium',
      title: `Build ${s.section} fundamentals`,
      detail: `${s.avgAccuracy}% accuracy across ${s.attempts} ${s.attempts === 1 ? 'test' : 'tests'}. Revise concepts, then practice chapter tests to close the gap.`,
      ctaLabel: 'Practice chapter tests',
      ctaTo: '/chapter-tests',
    });
  }

  if (
    overall.numericalAccuracy !== null &&
    overall.mcqAccuracy !== null &&
    overall.numericalAccuracy < overall.mcqAccuracy - 10
  ) {
    recs.push({
      priority: overall.numericalAccuracy < 50 ? 'high' : 'medium',
      title: 'Sharpen numerical answering',
      detail: `Numericals run at ${overall.numericalAccuracy}% vs ${overall.mcqAccuracy}% for MCQs. Do short calculation drills inside timed papers.`,
      ctaLabel: 'Take a full paper',
      ctaTo: '/paper-tests',
    });
  }

  if (overall.unattemptedRate >= 25) {
    recs.push({
      priority: 'medium',
      title: 'Improve time management',
      detail: `${overall.unattemptedRate}% of questions go unattempted. Skip hard ones early and bank the easy marks.`,
      ctaLabel: 'Try a timed paper',
      ctaTo: '/paper-tests',
    });
  }

  if (overall.accuracy < 60 && subjects.length > 0) {
    recs.push({
      priority: 'medium',
      title: 'Accuracy over speed',
      detail: `Overall accuracy is ${overall.accuracy}%. Fewer guesses means fewer negative-marking losses.`,
      ctaLabel: 'Review past tests',
      ctaTo: '/dashboard',
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 'low',
      title: "You're on a good track",
      detail: 'Keep the streak going — consistent tests are the fastest way to improve.',
      ctaLabel: 'Take your next test',
      ctaTo: '/paper-tests',
    });
  }

  return recs.slice(0, 4);
}

import { Link } from 'react-router-dom';
import {
  BookOpen, FileText, TrendingUp, Award, Clock, BarChart3,
  ArrowRight, Zap, Target, Brain, Flame, Play, ChevronRight,
  CheckCircle, AlertCircle, Bookmark
} from 'lucide-react';

const stats = [
  { icon: BookOpen, label: 'Tests Taken', value: '24', change: '+3 this week', color: 'from-blue-500 to-blue-600' },
  { icon: TrendingUp, label: 'Avg. Score', value: '68%', change: '+5% improvement', color: 'from-green-500 to-green-600' },
  { icon: Clock, label: 'Hours Practiced', value: '48h', change: '12h this week', color: 'from-purple-500 to-purple-600' },
  { icon: Flame, label: 'Day Streak', value: '7', change: 'Best: 14 days', color: 'from-orange-500 to-orange-600' },
];

const subjectProgress = [
  { name: 'Physics', total: 45, completed: 28, accuracy: 72, color: 'bg-blue-500' },
  { name: 'Chemistry', total: 40, completed: 22, accuracy: 65, color: 'bg-green-500' },
  { name: 'Mathematics', total: 38, completed: 18, accuracy: 58, color: 'bg-purple-500' },
];

const recentTests = [
  { title: 'JEE Main 2023 Shift 1', score: 187, maxScore: 300, date: '2 days ago', subject: 'Full Test',
    topics: [{ name: 'Physics', correct: 22, total: 30 }, { name: 'Chemistry', correct: 18, total: 30 }, { name: 'Mathematics', correct: 20, total: 30 }] },
  { title: 'Electrostatics', score: 24, maxScore: 30, date: '5 days ago', subject: 'Physics',
    topics: [{ name: 'Physics', correct: 24, total: 30 }] },
  { title: 'Chemical Bonding', score: 18, maxScore: 25, date: '1 week ago', subject: 'Chemistry',
    topics: [{ name: 'Chemistry', correct: 18, total: 25 }] },
];

const weakTopics = [
  { topic: 'Rotational Motion', subject: 'Physics', accuracy: 45, questions: 12 },
  { topic: 'Chemical Bonding', subject: 'Chemistry', accuracy: 52, questions: 8 },
  { topic: 'Coordinate Geometry', subject: 'Mathematics', accuracy: 48, questions: 10 },
];

const recommendations = [
  { title: 'Kinematics', desc: '75% accuracy — keep it up!', type: 'strong' as const },
  { title: 'Thermodynamics', desc: 'Needs practice — 45% accuracy', type: 'weak' as const },
  { title: 'Complex Numbers', desc: 'Unattempted — give it a try', type: 'new' as const },
];

export default function Dashboard() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome + Quick Resume */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Aditya!</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Target: JEE Main 2027 &middot; 365 days to go
            </p>
          </div>
          <Link
            to="/test"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
          >
            <Play className="w-4 h-4 fill-current" />
            Continue Last Test
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-400 font-medium">{s.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Performance Overview */}
          <div className="lg:col-span-2 space-y-6">

            {/* Subject Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Subject Progress
                </h2>
                <Link to="/chapter-tests" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                  Practice <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-5">
                {subjectProgress.map((sub) => {
                  const pct = Math.round((sub.completed / sub.total) * 100);
                  return (
                    <div key={sub.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                        <span className="text-xs text-gray-400">{sub.completed}/{sub.total} tests &middot; {sub.accuracy}% accuracy</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`${sub.color} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Tests */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Recent Tests
                </h2>
                <Link to="/paper-tests" className="text-sm text-primary font-medium hover:underline">View all</Link>
              </div>
              <div className="space-y-4">
                {recentTests.map((test, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{test.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{test.subject} &middot; {test.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{test.score}<span className="text-sm text-gray-400 font-normal">/{test.maxScore}</span></div>
                        <div className="text-xs text-success font-medium">{Math.round((test.score / test.maxScore) * 100)}%</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {test.topics.map((topic) => (
                        <div key={topic.name} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          <span>{topic.name}:</span>
                          <span className={topic.correct / topic.total >= 0.6 ? 'text-success font-medium' : 'text-red-500 font-medium'}>
                            {topic.correct}/{topic.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
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
                <Link to="/test" className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all group">
                  <Play className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Quick Test</span>
                </Link>
                <Link to="/pricing" className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all group">
                  <Award className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700">Upgrade</span>
                </Link>
              </div>
            </div>

            {/* Weak Areas */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Focus Areas
              </h2>
              <div className="space-y-4">
                {weakTopics.map((topic, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-900 font-medium">{topic.topic}</span>
                      <span className="text-red-500 font-medium text-xs">{topic.accuracy}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1.5">{topic.subject} &middot; {topic.questions} questions</div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-red-400 h-1.5 rounded-full transition-all" style={{ width: `${topic.accuracy}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/chapter-tests" className="flex items-center justify-center gap-1 mt-4 text-sm text-primary font-medium py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                Practice Weak Topics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Recommendations
              </h2>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      rec.type === 'strong' ? 'bg-green-50 text-green-600' :
                      rec.type === 'weak' ? 'bg-red-50 text-red-500' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {rec.type === 'strong' ? <CheckCircle className="w-4 h-4" /> :
                       rec.type === 'weak' ? <AlertCircle className="w-4 h-4" /> :
                       <Bookmark className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rec.title}</div>
                      <div className="text-xs text-gray-500">{rec.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Unlock All Features</h3>
            <p className="text-indigo-100 text-sm">Get access to all chapter tests, full papers, and detailed analytics.</p>
          </div>
          <Link to="/pricing" className="flex items-center gap-2 bg-white text-primary px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors shrink-0">
            View Plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

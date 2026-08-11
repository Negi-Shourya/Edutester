import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, BookOpen, Lock, X } from 'lucide-react';
import TestCard from '../components/TestCard';
import StaggerReveal, { StaggerItem } from '../components/StaggerReveal';
import { chapterTests, subjects } from '../data/chapters';

export default function ChapterTests() {
  const [subject, setSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const filtered = chapterTests.filter((t) => {
    const matchSubject = subject === 'All' || t.subject === subject;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.chapter?.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-display animate-fade-up">Chapter-wise Tests</h1>
          <p className="text-gray-500 mt-1">Master each topic with focused practice tests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chapter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['All', ...subjects].map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-target-40 ${
                    subject === s
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coming soon notice */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            <span className="font-semibold">Coming soon:</span> A team is working on it. It will be coming soon.
          </span>
        </div>

        {/* Subjects Grid */}
        {subject === 'All' ? (
          subjects.map((sub) => {
            const subTests = filtered.filter((t) => t.subject === sub);
            if (subTests.length === 0) return null;
            return (
              <div key={sub} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">{sub}</h2>
                  <span className="text-xs text-gray-400">({subTests.length} tests)</span>
                </div>
                <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subTests.map((test) => (
                    <StaggerItem key={test.id}>
                      <TestCard test={test} comingSoon onComingSoon={() => setShowComingSoon(true)} />
                    </StaggerItem>
                  ))}
                </StaggerReveal>
              </div>
            );
          })
        ) : (
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((test) => (
              <StaggerItem key={test.id}>
                <TestCard test={test} comingSoon onComingSoon={() => setShowComingSoon(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No tests found. Try a different search or filter.</p>
          </div>
        )}
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowComingSoon(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
                <Lock className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Coming Soon</h2>
              <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                A team is working on it. It will be coming soon.
              </p>

              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Not now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

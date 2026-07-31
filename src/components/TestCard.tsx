import { Clock, FileText, BarChart3, Play, CheckCircle } from 'lucide-react';
import type { TestCardData } from '../types';

interface Props {
  test: TestCardData;
}

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

export default function TestCard({ test }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary/20 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {test.title}
          </h3>
          {test.subject && (
            <span className="text-xs text-gray-500 mt-0.5 block">{test.subject}</span>
          )}
        </div>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${difficultyColors[test.difficulty]}`}>
          {test.difficulty}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          {test.questions} Q
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {test.duration} min
        </span>
        {test.year && (
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            {test.year}
          </span>
        )}
      </div>
      {test.completed && test.score !== undefined && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-success font-medium">Score: {test.score}/300</span>
        </div>
      )}
      <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-primary bg-indigo-50 hover:bg-indigo-100 transition-colors">
        <Play className="w-4 h-4" />
        {test.completed ? 'Retake Test' : 'Start Test'}
      </button>
    </div>
  );
}

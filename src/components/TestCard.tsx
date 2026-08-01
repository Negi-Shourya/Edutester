import { useNavigate } from 'react-router-dom';
import { Clock, FileText, BarChart3, Play, CheckCircle, Lock, Gift } from 'lucide-react';
import type { TestCardData } from '../types';

interface Props {
  test: TestCardData;
  locked?: boolean;
  trial?: boolean;
  onLocked?: () => void;
}

const difficultyColors = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
};

export default function TestCard({ test, locked, trial, onLocked }: Props) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (locked) {
      onLocked?.();
      return;
    }
    navigate('/test');
  };

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
        <div className="flex flex-col items-end gap-1">
          {trial ? (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Free Trial
            </span>
          ) : (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${difficultyColors[test.difficulty]}`}>
              {test.difficulty}
            </span>
          )}
        </div>
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
      {locked ? (
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Lock className="w-4 h-4" />
          Upgrade to Unlock
        </button>
      ) : (
        <button
          onClick={handleStart}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            trial
              ? 'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              : 'text-primary bg-indigo-50 hover:bg-indigo-100'
          }`}
        >
          <Play className="w-4 h-4" />
          {test.completed ? 'Retake Test' : trial ? 'Start Free Test' : 'Start Test'}
        </button>
      )}
    </div>
  );
}

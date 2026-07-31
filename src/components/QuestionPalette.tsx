import type { QuestionState } from '../types';

interface Props {
  questions: QuestionState[];
  currentQuestion: number;
  onSelect: (id: number) => void;
}

const statusLabels: Record<string, string> = {
  'not-visited': 'Not Visited',
  'not-answered': 'Not Answered',
  'answered': 'Answered',
  'marked': 'Marked & Next',
};

const statusColors: Record<string, string> = {
  'not-visited': 'bg-gray-100 border-gray-200',
  'not-answered': 'bg-red-100 border-red-200',
  'answered': 'bg-green-100 border-green-200',
  'marked': 'bg-purple-100 border-purple-200',
};

export default function QuestionPalette({ questions, currentQuestion, onSelect }: Props) {
  const counts = questions.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Question Palette</h3>

      <div className="space-y-1.5 mb-4">
        {Object.entries(statusLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm border ${statusColors[key]}`} />
              <span className="text-gray-600">{label}</span>
            </div>
            <span className="font-medium text-gray-900">{counts[key] || 0}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onSelect(q.id)}
            className={`w-8 h-8 text-xs font-medium rounded border transition-all ${
              q.id === currentQuestion
                ? 'ring-2 ring-primary border-primary bg-blue-50 text-primary'
                : statusColors[q.status]
            }`}
          >
            {q.id}
          </button>
        ))}
      </div>
    </div>
  );
}

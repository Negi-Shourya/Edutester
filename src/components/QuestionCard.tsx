import type { Question } from '../types';

interface Props {
  question: Question;
  selectedOption?: string;
  onSelect: (option: string) => void;
}

export default function QuestionCard({ question, selectedOption, onSelect }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {question.section} &middot; Question {question.number}
        </span>
      </div>
      <p className="text-gray-900 font-medium mb-6 leading-relaxed">
        {question.text}
      </p>
      <div className="space-y-3">
        {question.options.map((option) => (
          <label
            key={option.label}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              selectedOption === option.label
                ? 'border-primary bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              value={option.label}
              checked={selectedOption === option.label}
              onChange={() => onSelect(option.label)}
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium text-gray-900">{option.label}.</span> {option.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

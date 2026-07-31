import { Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  title: string;
  duration: number;
  onTimeUp: () => void;
}

export default function TestHeader({ title, duration, onTimeUp }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isLow = timeLeft < 300;

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-primary">JE</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">JEE Main Mock</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">A</span>
            </div>
            <span>Aditya Sharma</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
            isLow ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-700'
          }`}>
            {isLow && <AlertTriangle className="w-4 h-4" />}
            <Clock className="w-4 h-4" />
            <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

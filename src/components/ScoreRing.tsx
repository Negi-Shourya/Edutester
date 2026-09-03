import { useEffect, useState } from 'react';

export interface RingSegment {
  value: number;
  color: string;
  label: string;
}

interface ScoreRingProps {
  // Share of the full circle (0-100) shown as the headline number.
  percent: number;
  centerLabel?: string;
  // Stacked outcome segments around the ring (e.g. correct / incorrect /
  // unattempted). Lengths are relative — they are normalized to the total.
  segments?: RingSegment[];
  size?: number;
  stroke?: number;
  // Shown under the ring; defaults to a legend built from segments.
  legend?: boolean;
}

// Animated SVG donut: the headline arc sweeps in on mount (CSS transition),
// segments show the outcome split. Zero dependencies — pure SVG + CSS.
export default function ScoreRing({
  percent,
  centerLabel,
  segments = [],
  size = 148,
  stroke = 16,
  legend = true,
}: ScoreRingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(t);
  }, []);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, g) => s + g.value, 0);

  let acc = 0;
  const arcs = segments.map((seg) => {
    const frac = total > 0 ? seg.value / total : 0;
    const arc = {
      ...seg,
      dash: frac * circumference,
      offset: acc * circumference,
    };
    acc += frac;
    return arc;
  });

  const headFrac = Math.max(0, Math.min(100, percent)) / 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-gray-100"
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${mounted ? arc.dash : 0} ${circumference}`}
              strokeDashoffset={-arc.offset}
              style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          ))}
          {/* Headline progress hairline over the segments */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={3}
            className="stroke-white/70"
            strokeDasharray={`${mounted ? headFrac * circumference : 0} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900 font-mono leading-none">
            {percent}%
          </span>
          {centerLabel && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-1">
              {centerLabel}
            </span>
          )}
        </div>
      </div>
      {legend && segments.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {segments.map((seg) => (
            <span key={seg.label} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="font-medium">{seg.label}</span>
              <span className="font-mono font-semibold text-gray-900">{seg.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

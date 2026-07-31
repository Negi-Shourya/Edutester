import { Fragment } from 'react';

// Matches \vec{...} markup (with one level of nested braces, e.g. \vec{r}, \vec{E₁})
const VEC_RE = /(\\vec\{(?:[^{}]|\{[^{}]*\})*\})/g;
const VEC_SINGLE = /^\\vec\{((?:[^{}]|\{[^{}]*\})*)\}$/;

interface VectorTextProps {
  text: string;
}

// Renders \vec{X} markup (stored in the database) with a CSS/SVG-drawn arrow
// above the symbol, so vectors render identically in every browser and font.
export default function VectorText({ text }: VectorTextProps) {
  if (!text) return null;

  const parts = text.split(VEC_RE);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(VEC_SINGLE);
        if (match) {
          return <Vector key={i} content={match[1]} />;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function Vector({ content }: { content: string }) {
  return (
    <span className="vec" aria-label={`vector ${content}`}>
      <span className="vec-arrow" aria-hidden="true">
        <svg viewBox="0 0 12 6" preserveAspectRatio="none">
          <line x1="0.75" y1="3" x2="8.75" y2="3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7.6 0.7 L11 3 L7.6 5.3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="vec-letter">{content}</span>
    </span>
  );
}

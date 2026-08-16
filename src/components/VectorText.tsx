import { Fragment, type ReactNode, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { tokenizeMath } from '../lib/mathText';

interface VectorTextProps {
  text: string;
}

/**
 * Render a LaTeX string using KaTeX (inline mode).
 * Falls back to raw text if KaTeX fails to parse.
 */
function renderKatex(latex: string, key: string | number): ReactNode {
  try {
    const html = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false,
      strict: false,
      trust: true,
      output: 'html',
    });
    return (
      <span
        key={key}
        className="katex-inline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    // Fallback: render as plain text
    return <span key={key}>{latex}</span>;
  }
}

// Renders \\vec{X}, \\frac{n}{d}, _{…}, ^{…} markup, [[matrix]] notation,
// unicode sub/superscripts and division as fractions — see src/lib/mathText.
export default function VectorText({ text }: VectorTextProps) {
  const nodes = useMemo(() => {
    if (!text) return null;
    const segments = tokenizeMath(text);
    return segments.map((seg, i) => {
      if (seg.kind === 'text') {
        return <Fragment key={i}>{seg.value}</Fragment>;
      }
      return renderKatex(seg.value, i);
    });
  }, [text]);

  return <>{nodes}</>;
}

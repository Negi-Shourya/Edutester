import { Fragment, type ReactNode, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { tokenizeMath } from '../lib/mathText';

interface VectorTextProps {
  text: string;
}

// In-memory cache for rendered KaTeX HTML strings (drops re-render time from ~50ms to <0.01ms)
const katexHtmlCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

/**
 * Render a LaTeX string using KaTeX (inline mode) with caching.
 * Falls back to raw text if KaTeX fails to parse.
 */
function renderKatex(latex: string, key: string | number): ReactNode {
  let html = katexHtmlCache.get(latex);

  if (!html) {
    try {
      html = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
        strict: false,
        trust: true,
        output: 'html',
      });
      if (katexHtmlCache.size < MAX_CACHE_SIZE) {
        katexHtmlCache.set(latex, html);
      }
    } catch {
      // Fallback: render as plain text
      return <span key={key}>{latex}</span>;
    }
  }

  return (
    <span
      key={key}
      className="katex-inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
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

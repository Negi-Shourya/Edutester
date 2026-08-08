import { Fragment, type ReactNode, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ────────────────────────────────────────────────────────────
// VectorText — renders database markup using KaTeX
//
// The extraction script stores math using a LaTeX-like syntax:
//   _{...}  → subscript        ^{...}  → superscript
//   \vec{X} → vector arrow     \frac{n}{d} → fraction
//   _X      → single-char sub  ^X      → single-char sup
//   Unicode ¹²³₀₁₂… chars     Greek letters (α, β, …)
//
// This component splits the input into alternating text and math
// segments and renders math through KaTeX for professional output.
// ────────────────────────────────────────────────────────────

interface VectorTextProps {
  text: string;
}

// ── Segment Types ──
type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string };

// ── Regex to find math markup in our custom notation ──
// Matches: \vec{…}, \frac{…}{…}, _{…}, ^{…}, _X, ^X, unicode sub/sup chars
const MATH_TOKEN_RE =
  /\\vec\{(?:[^{}]|\{[^{}]*\})*\}|\\frac\{(?:[^{}]|\{[^{}]*\})*\}\{(?:[^{}]|\{[^{}]*\})*\}|_\{[^{}]*\}|\^\{[^{}]*\}|_[A-Za-z0-9]|\^[A-Za-z0-9+\-]+|[\u00B9\u00B2\u00B3\u2070\u2071\u2074-\u207F\u2080-\u209C]+/g;

// Unicode superscript → LaTeX
const SUPER_MAP: Record<string, string> = {
  '\u00B9': '1', '\u00B2': '2', '\u00B3': '3',
  '\u2070': '0', '\u2071': 'i', '\u2074': '4',
  '\u2075': '5', '\u2076': '6', '\u2077': '7',
  '\u2078': '8', '\u2079': '9', '\u207A': '+',
  '\u207B': '-', '\u207C': '=', '\u207D': '(',
  '\u207E': ')', '\u207F': 'n',
};

const SUB_MAP: Record<string, string> = {
  '\u2080': '0', '\u2081': '1', '\u2082': '2',
  '\u2083': '3', '\u2084': '4', '\u2085': '5',
  '\u2086': '6', '\u2087': '7', '\u2088': '8',
  '\u2089': '9', '\u2090': 'a', '\u2091': 'e',
  '\u2092': 'o', '\u2093': 'x', '\u2095': 'h',
  '\u2096': 'k', '\u2097': 'l', '\u2098': 'm',
  '\u2099': 'n', '\u209A': 'p', '\u209B': 's',
  '\u209C': 't',
};

/**
 * Convert a single matched token from our custom notation into LaTeX.
 */
function tokenToLatex(raw: string): string {
  // \vec{X} → \vec{X} (already valid LaTeX)
  if (raw.startsWith('\\vec{')) return raw;

  // \frac{n}{d} → \frac{n}{d} (already valid LaTeX)
  if (raw.startsWith('\\frac{')) return raw;

  // _{content} → _{content} (already valid LaTeX)
  if (raw.startsWith('_{')) return raw;

  // ^{content} → ^{content} (already valid LaTeX)
  if (raw.startsWith('^{')) return raw;

  // _X → _{X} (single char subscript)
  if (raw.startsWith('_')) return `_{${raw.slice(1)}}`;

  // ^X → ^{X} (single char superscript — could be multi-char like ^{-1})
  if (raw.startsWith('^')) return `^{${raw.slice(1)}}`;

  // Unicode superscript/subscript characters
  let sup = '';
  let sub = '';
  for (const ch of raw) {
    if (ch in SUPER_MAP) sup += SUPER_MAP[ch];
    else if (ch in SUB_MAP) sub += SUB_MAP[ch];
  }
  if (sup && sub) return `^{${sup}}_{${sub}}`;
  if (sup) return `^{${sup}}`;
  if (sub) return `_{${sub}}`;

  return raw;
}

/**
 * Parse text into alternating text/math segments.
 * Adjacent math tokens are merged into a single LaTeX expression.
 */
function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MATH_TOKEN_RE.lastIndex = 0;

  while ((match = MATH_TOKEN_RE.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      segments.push({ kind: 'text', value: textBefore });
    }

    const latex = tokenToLatex(match[0]);

    // Merge with previous math segment if adjacent
    const prev = segments[segments.length - 1];
    if (prev && prev.kind === 'math') {
      prev.value += latex;
    } else {
      segments.push({ kind: 'math', value: latex });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: 'text', value: text.slice(lastIndex) });
  }

  return segments;
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

// Renders \\vec{X}, \\frac{n}{d}, _{…}, ^{…} markup and unicode
// sub/superscript characters using KaTeX for professional math display.
export default function VectorText({ text }: VectorTextProps) {
  const nodes = useMemo(() => {
    if (!text) return null;
    const segments = parseSegments(text);
    return segments.map((seg, i) => {
      if (seg.kind === 'text') {
        return <Fragment key={i}>{seg.value}</Fragment>;
      }
      return renderKatex(seg.value, i);
    });
  }, [text]);

  return <>{nodes}</>;
}

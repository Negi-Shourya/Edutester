import { Fragment, type ReactNode, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ────────────────────────────────────────────────────────────
// VectorText — renders database markup using KaTeX
//
// The extraction script stores math using a LaTeX-like syntax:
//   _{...}  → subscript     ^{...}  → superscript
//   \vec{X} → vector arrow  \frac{n}{d} → fraction
//   _X      → single-char sub  ^X → single-char sup
//   Unicode ¹²³₀₁₂… chars, Greek letters (α, β, …)
//
// Unicode math symbols are converted to LaTeX first, then the
// text is split into alternating text/math segments and math is
// rendered through KaTeX. Standalone ^{…}/_{…} tokens inherit
// the character (or number / closing bracket) that precedes them
// as their base, so "10^{4}", "n^{1/3}" and "I_0" render correctly.
// ────────────────────────────────────────────────────────────

interface VectorTextProps {
  text: string;
}

// ── Segment Types ──
type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string };

// Balanced {…} group (supports one level of nested {…}, e.g. {\frac{a}{b}})
const GROUP_SRC = String.raw`\{(?:[^{}]|\{[^{}]*\})*\}`;
// A ^{…}/_{…} group — also tolerates empty {} pairs inside (e.g. ^{\alpha{}})
const SCRIPT_GROUP_SRC = String.raw`[_\^]\{(?:[^{}]|\{\})*\}`;

// ── Regex to find math markup in our custom notation ──
// Order matters: command names first (so \frac is a command, not a group),
// then brace groups, explicit _/^ groups, then unicode sub/sup chars.
// Bare commands only match the command name itself — adjacent tokens
// (arguments, scripts) are merged later, so prose after \times is never
// swallowed into the math expression.
const MATH_TOKEN_RE = new RegExp(
  [
    String.raw`\\[a-zA-Z]+`,
    GROUP_SRC,
    SCRIPT_GROUP_SRC,
    String.raw`_[A-Za-z0-9]|\^[A-Za-z0-9+\-]+`,
    String.raw`[\u00B9\u00B2\u00B3\u2070\u2071\u2074-\u207F\u2080-\u209C]+`,
  ].join('|'),
  'g'
);

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

// Unicode math letters/symbols → LaTeX (applied before tokenizing).
// Commands are terminated with {} so that a following letter/digit
// (e.g. "πm" → \pi{}m) is not swallowed into the command name.
const UNICODE_MATH: Record<string, string> = {
  'α': '\\alpha{}', 'β': '\\beta{}', 'γ': '\\gamma{}', 'δ': '\\delta{}',
  'ε': '\\epsilon{}', 'ζ': '\\zeta{}', 'η': '\\eta{}', 'θ': '\\theta{}',
  'ι': '\\iota{}', 'κ': '\\kappa{}', 'λ': '\\lambda{}', 'μ': '\\mu{}',
  'µ': '\\mu{}', 'ν': '\\nu{}', 'ξ': '\\xi{}', 'π': '\\pi{}',
  'ρ': '\\rho{}', 'σ': '\\sigma{}', 'τ': '\\tau{}', 'υ': '\\upsilon{}',
  'φ': '\\phi{}', 'χ': '\\chi{}', 'ψ': '\\psi{}', 'ω': '\\omega{}',
  'Γ': '\\Gamma{}', 'Δ': '\\Delta{}', 'Θ': '\\Theta{}', 'Λ': '\\Lambda{}',
  'Ξ': '\\Xi{}', 'Π': '\\Pi{}', 'Σ': '\\Sigma{}', 'Φ': '\\Phi{}',
  'Ψ': '\\Psi{}', 'Ω': '\\Omega{}',
  '×': '\\times', '∝': '\\propto', '±': '\\pm', '∓': '\\mp',
  '≤': '\\le', '≥': '\\ge', '≠': '\\ne', '≈': '\\approx',
  '∞': '\\infty', '→': '\\to', '←': '\\leftarrow', '⋅': '\\cdot',
  '∠': '\\angle', '∥': '\\parallel', '∈': '\\in', '⇒': '\\Rightarrow',
};

/**
 * Normalize the input: unicode dashes → minus, unicode math → LaTeX.
 */
function preprocess(text: string): string {
  let out = text.replace(/[\u2013\u2212]/g, '-');
  for (const [ch, latex] of Object.entries(UNICODE_MATH)) {
    if (out.includes(ch)) out = out.split(ch).join(latex);
  }
  return out;
}

/**
 * Convert a single matched token from our custom notation into LaTeX.
 */
function tokenToLatex(raw: string): string {
  // Commands (\times, \cdot, \sqrt, \frac, \theta, …) and {…} groups pass through
  if (raw.startsWith('\\') || raw.startsWith('{')) return raw;

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

// Characters that can act as the base of a ^{…}/_{…} token
const BASE_TAIL_RE = /[A-Za-z0-9)\]}]+$/;

/**
 * Parse text into alternating text/math segments.
 * Adjacent math tokens are merged into a single LaTeX expression.
 */
function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const processed = preprocess(text);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MATH_TOKEN_RE.lastIndex = 0;

  while ((match = MATH_TOKEN_RE.exec(processed)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: processed.slice(lastIndex, match.index) });
    }

    let latex = tokenToLatex(match[0]);

    // A standalone ^{…}/_{…} token inherits the trailing base character(s)
    // from the preceding text segment (e.g. "10" in "10^{4}").
    const prev = segments[segments.length - 1];
    if ((latex.startsWith('^') || latex.startsWith('_')) && prev && prev.kind === 'text') {
      const pulled = prev.value.match(BASE_TAIL_RE);
      if (pulled) {
        prev.value = prev.value.slice(0, prev.value.length - pulled[0].length);
        latex = pulled[0] + latex;
        if (prev.value === '') segments.pop();
      }
    }

    // Merge with previous math segment if adjacent
    if (prev && prev.kind === 'math') {
      prev.value += latex;
    } else {
      segments.push({ kind: 'math', value: latex });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processed.length) {
    segments.push({ kind: 'text', value: processed.slice(lastIndex) });
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

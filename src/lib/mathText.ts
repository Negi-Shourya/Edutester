// ────────────────────────────────────────────────────────────
// mathText — pure (React-free) pipeline for rendering DB math
//
// Handles the custom LaTeX-like markup ( _{...}, ^{...}, \vec{},
// \frac{n}{d}, \sqrt{}, …) plus the JEE extraction notation:
//   [[a, b], [c, d]]        → KaTeX smallmatrix (square brackets)
//   ᵀ ᵃ ᵇ ᵗ ᵖ ᵐ ˢ ᵢ ᵣ ᵥ ⱼ     → superscript/subscript letters
//   X̂ (U+0302) / X̄ (U+0304) → \hat{X} / \bar{X}
//   √3, √(x - 1)            → \sqrt{3}, \sqrt{x - 1}
//   a/b, π/4, (x + 1)/3     → \frac{a}{b}, \frac{π}{4}, …
//   det( adj( arg( ln(      → \det( \operatorname{adj}( \arg( \ln(
//   ℤ ℕ ℚ ℝ ℂ              → \mathbb{Z} …
//
// All text flows through this pipeline (question stems, options,
// result screen, question paper modal) so a fix applies everywhere.
// ────────────────────────────────────────────────────────────

export type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'math'; value: string };

// Balanced {…} group with nested braces up to a fixed depth, e.g.
// {R_{1}} (script-group inside), {\frac{R_{1}}{R_{2}}} (\frac inside),
// {\sqrt{\frac{a}{b}}}. JS regex can't recurse, so expand the depth
// explicitly. Depth 5 covers every real occurrence in the content.
const GROUP_DEPTH = 5;
function buildGroupSrc(depth: number): string {
  let inner = String.raw`[^{}]*`;
  for (let i = 1; i < depth; i++) {
    inner = String.raw`(?:[^{}]|` + String.raw`\{` + inner + String.raw`\})*`;
  }
  return String.raw`\{` + inner + String.raw`\}`;
}
const GROUP_SRC = buildGroupSrc(GROUP_DEPTH);
// A ^{…}/_{…} group — also tolerates empty {} pairs inside (e.g. ^{\alpha{}})
const SCRIPT_GROUP_SRC = String.raw`[_\^]\{(?:[^{}]|\{\})*\}`;

// A whole smallmatrix environment must stay ONE math segment — the
// tokenizer below would otherwise split its content into text pieces.
const SMALLMATRIX_SRC = String.raw`\\left\[\\begin\{smallmatrix\}[\s\S]*?\\end\{smallmatrix\}\\right\]`;

// ── Regex to find math markup in our custom notation ──
// Order matters: command names first (so \frac is a command, not a group),
// then brace groups, explicit _/^ groups, then unicode sub/sup chars.
// Bare commands only match the command name itself — adjacent tokens
// (arguments, scripts) are merged later, so prose after \times is never
// swallowed into the math expression.
const MATH_TOKEN_RE = new RegExp(
  [
    SMALLMATRIX_SRC,
    String.raw`\\[a-zA-Z]+(?:\[[^\[\]]*\])?`,
    GROUP_SRC,
    SCRIPT_GROUP_SRC,
    String.raw`_[A-Za-z0-9]|\^[A-Za-z0-9+\-]+`,
    String.raw`[\u00B9\u00B2\u00B3\u2070\u2071\u2074-\u207F\u2080-\u209C\u02B0-\u02E5\u1D40\u1D43-\u1D9C]+`,
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
  '\u1D40': 'T', '\u1D43': 'a', '\u1D47': 'b',
  '\u1D48': 'd', '\u1D49': 'e', '\u1D4D': 'g',
  '\u1D4F': 'n', '\u1D50': 'm', '\u1D52': 'o',
  '\u1D56': 'p', '\u1D57': 't', '\u1D58': 'u',
  '\u1D5B': 'v', '\u1D9C': 'c',
  '\u02B0': 'h', '\u02B2': 'j', '\u02B3': 'r',
  '\u02E1': 'l', '\u02E2': 's', '\u02E3': 'x',
  '\u02E4': 'y', '\u02B7': 'w',
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
  '\u1D62': 'i', '\u1D63': 'r', '\u1D65': 'v',
  '\u2C7C': 'j',
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
  '×': '\\times{}', '∝': '\\propto{}', '±': '\\pm{}', '∓': '\\mp{}',
  '≤': '\\le{}', '≥': '\\ge{}', '≠': '\\ne{}', '≈': '\\approx{}',
  '∞': '\\infty{}', '→': '\\to{}', '←': '\\leftarrow{}', '⋅': '\\cdot{}',
  '∠': '\\angle{}', '∥': '\\parallel{}', '∈': '\\in{}', '⇒': '\\Rightarrow{}',
  'ℤ': '\\mathbb{Z}', 'ℕ': '\\mathbb{N}', 'ℚ': '\\mathbb{Q}',
  'ℝ': '\\mathbb{R}', 'ℂ': '\\mathbb{C}',
};

// ── Fraction conversion helpers ──

// Lowercase word: multi-letter all-lowercase (e.g. "mol", "molarity", "dx")
const WORD_RE = /^[a-z]{2,}$/;
// Chemical formula-ish token (e.g. "Sn", "HCl", "kJ", "KOH")
const CHEM_RE = /^(?:[A-Z][a-z]?)+$/;
// Characters that terminate a fraction operand
const FRAC_BOUNDARY_RE = /[\s=+<>&|;,·→⇒≤≥×:±−-]/;
// Mathy indicators — a run counts as math if it carries any of these
const MATHY_RE = /[0-9α-ωΑ-Ωa-zA-Zπ\u00B9\u00B2\u00B3\u2070-\u207F\u2080-\u209C√^_{}\\]/;

function countParens(s: string): number {
  let n = 0;
  for (const ch of s) {
    if (ch === '(') n++;
    else if (ch === ')') n--;
  }
  return n;
}

// Brace depth at position idx — slashes inside {…} groups (script groups
// like "_{1/2}", \sqrt{…}, \int_{π/6}^{π/3}) are left as-is.
function braceDepthAt(text: string, idx: number): number {
  let depth = 0;
  for (let i = 0; i < idx; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth = Math.max(0, depth - 1);
  }
  return depth;
}

/**
 * Convert X/Y (in math contexts) to \frac{X}{Y}.
 * Conservative on purpose: unit-like pairs (g/mol, kJ/mol, w/w),
 * chemical reagent arrows (AlCl₃/HCl → A) and word mixes (Ag₂CrO₄ /
 * molarity) keep the slash.
 */
function convertFractions(text: string): string {
  let out = text;
  // Right-to-left so nested "a/b/c" resolves innermost last.
  let idx = out.lastIndexOf('/');
  while (idx >= 0) {
    // Slashes inside {…} groups (script groups like "t_{1/2}", "^{1/2}",
    // "\sqrt{…}", "∫_{π/6}^{π/3}") stay inline — converting them breaks
    // the brace structure.
    if (braceDepthAt(out, idx) > 0) {
      idx = out.lastIndexOf('/', idx - 1);
      continue;
    }
    // Left operand: scan left over non-boundary chars → [ls, idx)
    let ls = idx - 1;
    while (ls >= 0 && !FRAC_BOUNDARY_RE.test(out[ls])) ls--;
    ls++;
    let L = out.slice(ls, idx);
    // Dangling closing parens on the left → extend one char at a time
    // until balanced (e.g. "(x - 2)" from "2)").
    while (ls > 0 && countParens(L) < 0) {
      ls--;
      L = out.slice(ls, idx);
    }
    // Right operand: scan right over non-boundary chars → (idx, ri)
    let ri = idx + 1;
    while (ri < out.length && !FRAC_BOUNDARY_RE.test(out[ri])) ri++;
    let R = out.slice(idx + 1, ri);
    while (ri < out.length && countParens(R) > 0) {
      ri++;
      R = out.slice(idx + 1, ri);
    }
    // A dangling ")" on R can belong to a "(" just left of L
    // (e.g. "((x³ + 1) / (x² + 1))" → drop the outer ")").
    if (countParens(R) < 0 && ls > 0 && out[ls - 1] === '(') {
      R = R.slice(0, -1);
    }
    if (countParens(L) === 0 && countParens(R) === 0) {
      const after = out.slice(ri, ri + 12);
      const keepSlash =
        L === '' || R === '' ||
        /^(w|v)\/(w|v)$/.test(`${L}/${R}`) ||
        (L === 't₁' && R === '₂') ||
        (WORD_RE.test(L) !== WORD_RE.test(R)) ||
        (CHEM_RE.test(L) && CHEM_RE.test(R)) ||
        (!MATHY_RE.test(L) || !MATHY_RE.test(R)) ||
        /^[^→\n]{0,10}→/.test(after) ||
        /^\s+gives\b/.test(after);
      if (!keepSlash) {
        // Replace the whole [ls, ri) range (L + "/" + R) — otherwise L's
        // characters would be duplicated in the output.
        out = out.slice(0, ls) + `\\frac{${L}}{${R}}` + out.slice(ri);
      }
    }
    // continue scanning left of the original slash
    idx = out.lastIndexOf('/', idx - 1);
  }
  return out;
}

/**
 * Convert [[row, row]] matrix notation to a KaTeX smallmatrix.
 */
function convertMatrices(text: string): string {
  return text.replace(/\[\[[\s\S]*?\]\]/g, (m) => {
    const inner = m.slice(2, -2);
    const rows = inner.split('], [');
    const body = rows
      .map((row) =>
        row
          .split(',')
          .map((e) => e.trim())
          .join(' & ')
      )
      .join('\\\\');
    return `\\left[\\begin{smallmatrix}${body}\\end{smallmatrix}\\right]`;
  });
}

// Function names that should render as math operators when followed
// by (, {, [ or | (never as prose words like "max power").
const FUNC_NAMES: Record<string, string> = {
  det: '\\det',
  adj: '\\operatorname{adj}',
  cosec: '\\operatorname{cosec}',
  arg: '\\arg',
  ln: '\\ln',
  log: '\\log',
  gcd: '\\gcd',
  sin: '\\sin',
  cos: '\\cos',
  tan: '\\tan',
  cot: '\\cot',
  sec: '\\sec',
  min: '\\min',
  max: '\\max',
};

/**
 * Normalize the input: matrix notation, accents, square roots,
 * fractions, function names, dashes and unicode math → LaTeX.
 */
export function preprocessMath(text: string): string {
  let out = text;

  // Matrices first — entries keep their raw content so the later
  // passes (greek, fractions, …) apply inside the smallmatrix too.
  out = convertMatrices(out);

  // Combining accents: X̂ → \hat{X}, X̄ → \bar{X}
  out = out.replace(/([A-Za-z])\u0302/g, '\\hat{$1}');
  out = out.replace(/([A-Za-z])\u0304/g, '\\bar{$1}');

  // Square roots: √(…) and √X
  out = out.replace(/√\(([^()]*)\)/g, '\\sqrt{$1}');
  out = out.replace(/√([0-9α-ωΑ-Ωa-zA-Z])/g, '\\sqrt{$1}');

  // Division → proper fractions
  out = convertFractions(out);

  // Function names → math operators
  for (const [fn, latex] of Object.entries(FUNC_NAMES)) {
    out = out.replace(new RegExp(`\\b${fn}(?=\\(|\\{|\\[|\\|)`, 'g'), latex);
  }

  // Unicode dashes → minus, unicode math → LaTeX
  out = out.replace(/[\u2013\u2212]/g, '-');
  for (const [ch, latex] of Object.entries(UNICODE_MATH)) {
    if (out.includes(ch)) out = out.split(ch).join(latex);
  }

  // Half-life notation t₁/₂ → t_{1/2} (after the fraction pass, which
  // keeps the slash via the keepSlash rule below).
  out = out.replace(/t₁\/₂/g, 't_{1/2}');
  return out;
}

/**
 * Convert a single matched token from our custom notation into LaTeX.
 */
export function tokenToLatex(raw: string): string {
  // Smallmatrix environments and commands/groups pass through
  if (raw.startsWith('\\left[') || raw.startsWith('\\') || raw.startsWith('{')) return raw;

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
export function tokenizeMath(text: string): Segment[] {
  const segments: Segment[] = [];
  const processed = preprocessMath(text);
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

    // Merge with previous math segment if adjacent, folding consecutive
    // same-type scripts into one ("t_{2}_{g}" → "t_{2g}").
    const last = segments[segments.length - 1];
    if (last && last.kind === 'math') {
      const prevScript = last.value.match(/([_\^])\{[^{}]*\}$/);
      if (
        prevScript &&
        prevScript[1] === latex[0] &&
        (latex.startsWith('_{') || latex.startsWith('^{'))
      ) {
        last.value = last.value.slice(0, -1) + latex.slice(2);
      } else {
        last.value += latex;
      }
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

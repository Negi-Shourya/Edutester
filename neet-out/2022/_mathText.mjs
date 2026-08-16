// src/lib/mathText.ts
var GROUP_SRC = String.raw`\{(?:[^{}]|\{[^{}]*\})*\}`;
var SCRIPT_GROUP_SRC = String.raw`[_\^]\{(?:[^{}]|\{\})*\}`;
var SMALLMATRIX_SRC = String.raw`\\left\[\\begin\{smallmatrix\}[\s\S]*?\\end\{smallmatrix\}\\right\]`;
var MATH_TOKEN_RE = new RegExp(
  [
    SMALLMATRIX_SRC,
    String.raw`\\[a-zA-Z]+`,
    GROUP_SRC,
    SCRIPT_GROUP_SRC,
    String.raw`_[A-Za-z0-9]|\^[A-Za-z0-9+\-]+`,
    String.raw`[\u00B9\u00B2\u00B3\u2070\u2071\u2074-\u207F\u2080-\u209C\u02B0-\u02E5\u1D40\u1D43-\u1D9C]+`
  ].join("|"),
  "g"
);
var SUPER_MAP = {
  "\xB9": "1",
  "\xB2": "2",
  "\xB3": "3",
  "\u2070": "0",
  "\u2071": "i",
  "\u2074": "4",
  "\u2075": "5",
  "\u2076": "6",
  "\u2077": "7",
  "\u2078": "8",
  "\u2079": "9",
  "\u207A": "+",
  "\u207B": "-",
  "\u207C": "=",
  "\u207D": "(",
  "\u207E": ")",
  "\u207F": "n",
  "\u1D40": "T",
  "\u1D43": "a",
  "\u1D47": "b",
  "\u1D48": "d",
  "\u1D49": "e",
  "\u1D4D": "g",
  "\u1D4F": "n",
  "\u1D50": "m",
  "\u1D52": "o",
  "\u1D56": "p",
  "\u1D57": "t",
  "\u1D58": "u",
  "\u1D5B": "v",
  "\u1D9C": "c",
  "\u02B0": "h",
  "\u02B2": "j",
  "\u02B3": "r",
  "\u02E1": "l",
  "\u02E2": "s",
  "\u02E3": "x",
  "\u02E4": "y",
  "\u02B7": "w"
};
var SUB_MAP = {
  "\u2080": "0",
  "\u2081": "1",
  "\u2082": "2",
  "\u2083": "3",
  "\u2084": "4",
  "\u2085": "5",
  "\u2086": "6",
  "\u2087": "7",
  "\u2088": "8",
  "\u2089": "9",
  "\u2090": "a",
  "\u2091": "e",
  "\u2092": "o",
  "\u2093": "x",
  "\u2095": "h",
  "\u2096": "k",
  "\u2097": "l",
  "\u2098": "m",
  "\u2099": "n",
  "\u209A": "p",
  "\u209B": "s",
  "\u209C": "t",
  "\u1D62": "i",
  "\u1D63": "r",
  "\u1D65": "v",
  "\u2C7C": "j"
};
var UNICODE_MATH = {
  "\u03B1": "\\alpha{}",
  "\u03B2": "\\beta{}",
  "\u03B3": "\\gamma{}",
  "\u03B4": "\\delta{}",
  "\u03B5": "\\epsilon{}",
  "\u03B6": "\\zeta{}",
  "\u03B7": "\\eta{}",
  "\u03B8": "\\theta{}",
  "\u03B9": "\\iota{}",
  "\u03BA": "\\kappa{}",
  "\u03BB": "\\lambda{}",
  "\u03BC": "\\mu{}",
  "\xB5": "\\mu{}",
  "\u03BD": "\\nu{}",
  "\u03BE": "\\xi{}",
  "\u03C0": "\\pi{}",
  "\u03C1": "\\rho{}",
  "\u03C3": "\\sigma{}",
  "\u03C4": "\\tau{}",
  "\u03C5": "\\upsilon{}",
  "\u03C6": "\\phi{}",
  "\u03C7": "\\chi{}",
  "\u03C8": "\\psi{}",
  "\u03C9": "\\omega{}",
  "\u0393": "\\Gamma{}",
  "\u0394": "\\Delta{}",
  "\u0398": "\\Theta{}",
  "\u039B": "\\Lambda{}",
  "\u039E": "\\Xi{}",
  "\u03A0": "\\Pi{}",
  "\u03A3": "\\Sigma{}",
  "\u03A6": "\\Phi{}",
  "\u03A8": "\\Psi{}",
  "\u03A9": "\\Omega{}",
  "\xD7": "\\times{}",
  "\u221D": "\\propto{}",
  "\xB1": "\\pm{}",
  "\u2213": "\\mp{}",
  "\u2264": "\\le{}",
  "\u2265": "\\ge{}",
  "\u2260": "\\ne{}",
  "\u2248": "\\approx{}",
  "\u221E": "\\infty{}",
  "\u2192": "\\to{}",
  "\u2190": "\\leftarrow{}",
  "\u22C5": "\\cdot{}",
  "\u2220": "\\angle{}",
  "\u2225": "\\parallel{}",
  "\u2208": "\\in{}",
  "\u21D2": "\\Rightarrow{}",
  "\u2124": "\\mathbb{Z}",
  "\u2115": "\\mathbb{N}",
  "\u211A": "\\mathbb{Q}",
  "\u211D": "\\mathbb{R}",
  "\u2102": "\\mathbb{C}"
};
var WORD_RE = /^[a-z]{2,}$/;
var CHEM_RE = /^(?:[A-Z][a-z]?)+$/;
var FRAC_BOUNDARY_RE = /[\s=+<>&|;,·→⇒≤≥×:±−-]/;
var MATHY_RE = /[0-9α-ωΑ-Ωa-zA-Zπ\u00B9\u00B2\u00B3\u2070-\u207F\u2080-\u209C√^_{}\\]/;
function countParens(s) {
  let n = 0;
  for (const ch of s) {
    if (ch === "(") n++;
    else if (ch === ")") n--;
  }
  return n;
}
function braceDepthAt(text, idx) {
  let depth = 0;
  for (let i = 0; i < idx; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") depth = Math.max(0, depth - 1);
  }
  return depth;
}
function convertFractions(text) {
  let out = text;
  let idx = out.lastIndexOf("/");
  while (idx >= 0) {
    if (braceDepthAt(out, idx) > 0) {
      idx = out.lastIndexOf("/", idx - 1);
      continue;
    }
    let ls = idx - 1;
    while (ls >= 0 && !FRAC_BOUNDARY_RE.test(out[ls])) ls--;
    ls++;
    let L = out.slice(ls, idx);
    while (ls > 0 && countParens(L) < 0) {
      ls--;
      L = out.slice(ls, idx);
    }
    let ri = idx + 1;
    while (ri < out.length && !FRAC_BOUNDARY_RE.test(out[ri])) ri++;
    let R = out.slice(idx + 1, ri);
    while (ri < out.length && countParens(R) > 0) {
      ri++;
      R = out.slice(idx + 1, ri);
    }
    if (countParens(R) < 0 && ls > 0 && out[ls - 1] === "(") {
      R = R.slice(0, -1);
    }
    if (countParens(L) === 0 && countParens(R) === 0) {
      const after = out.slice(ri, ri + 12);
      const keepSlash = L === "" || R === "" || /^(w|v)\/(w|v)$/.test(`${L}/${R}`) || L === "t\u2081" && R === "\u2082" || WORD_RE.test(L) !== WORD_RE.test(R) || CHEM_RE.test(L) && CHEM_RE.test(R) || (!MATHY_RE.test(L) || !MATHY_RE.test(R)) || /^[^→\n]{0,10}→/.test(after) || /^\s+gives\b/.test(after);
      if (!keepSlash) {
        out = out.slice(0, ls) + `\\frac{${L}}{${R}}` + out.slice(ri);
      }
    }
    idx = out.lastIndexOf("/", idx - 1);
  }
  return out;
}
function convertMatrices(text) {
  return text.replace(/\[\[[\s\S]*?\]\]/g, (m) => {
    const inner = m.slice(2, -2);
    const rows = inner.split("], [");
    const body = rows.map(
      (row) => row.split(",").map((e) => e.trim()).join(" & ")
    ).join("\\\\");
    return `\\left[\\begin{smallmatrix}${body}\\end{smallmatrix}\\right]`;
  });
}
var FUNC_NAMES = {
  det: "\\det",
  adj: "\\operatorname{adj}",
  cosec: "\\operatorname{cosec}",
  arg: "\\arg",
  ln: "\\ln",
  log: "\\log",
  gcd: "\\gcd",
  sin: "\\sin",
  cos: "\\cos",
  tan: "\\tan",
  cot: "\\cot",
  sec: "\\sec",
  min: "\\min",
  max: "\\max"
};
function preprocessMath(text) {
  let out = text;
  out = convertMatrices(out);
  out = out.replace(/([A-Za-z])\u0302/g, "\\hat{$1}");
  out = out.replace(/([A-Za-z])\u0304/g, "\\bar{$1}");
  out = out.replace(/√\(([^()]*)\)/g, "\\sqrt{$1}");
  out = out.replace(/√([0-9α-ωΑ-Ωa-zA-Z])/g, "\\sqrt{$1}");
  out = convertFractions(out);
  for (const [fn, latex] of Object.entries(FUNC_NAMES)) {
    out = out.replace(new RegExp(`\\b${fn}(?=\\(|\\{|\\[|\\|)`, "g"), latex);
  }
  out = out.replace(/[\u2013\u2212]/g, "-");
  for (const [ch, latex] of Object.entries(UNICODE_MATH)) {
    if (out.includes(ch)) out = out.split(ch).join(latex);
  }
  out = out.replace(/t₁\/₂/g, "t_{1/2}");
  return out;
}
function tokenToLatex(raw) {
  if (raw.startsWith("\\left[") || raw.startsWith("\\") || raw.startsWith("{")) return raw;
  if (raw.startsWith("_{")) return raw;
  if (raw.startsWith("^{")) return raw;
  if (raw.startsWith("_")) return `_{${raw.slice(1)}}`;
  if (raw.startsWith("^")) return `^{${raw.slice(1)}}`;
  let sup = "";
  let sub = "";
  for (const ch of raw) {
    if (ch in SUPER_MAP) sup += SUPER_MAP[ch];
    else if (ch in SUB_MAP) sub += SUB_MAP[ch];
  }
  if (sup && sub) return `^{${sup}}_{${sub}}`;
  if (sup) return `^{${sup}}`;
  if (sub) return `_{${sub}}`;
  return raw;
}
var BASE_TAIL_RE = /[A-Za-z0-9)\]}]+$/;
function tokenizeMath(text) {
  const segments = [];
  const processed = preprocessMath(text);
  let lastIndex = 0;
  let match;
  MATH_TOKEN_RE.lastIndex = 0;
  while ((match = MATH_TOKEN_RE.exec(processed)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: processed.slice(lastIndex, match.index) });
    }
    let latex = tokenToLatex(match[0]);
    const prev = segments[segments.length - 1];
    if ((latex.startsWith("^") || latex.startsWith("_")) && prev && prev.kind === "text") {
      const pulled = prev.value.match(BASE_TAIL_RE);
      if (pulled) {
        prev.value = prev.value.slice(0, prev.value.length - pulled[0].length);
        latex = pulled[0] + latex;
        if (prev.value === "") segments.pop();
      }
    }
    const last = segments[segments.length - 1];
    if (last && last.kind === "math") {
      const prevScript = last.value.match(/([_\^])\{[^{}]*\}$/);
      if (prevScript && prevScript[1] === latex[0] && (latex.startsWith("_{") || latex.startsWith("^{"))) {
        last.value = last.value.slice(0, -1) + latex.slice(2);
      } else {
        last.value += latex;
      }
    } else {
      segments.push({ kind: "math", value: latex });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < processed.length) {
    segments.push({ kind: "text", value: processed.slice(lastIndex) });
  }
  return segments;
}
export {
  preprocessMath,
  tokenToLatex,
  tokenizeMath
};

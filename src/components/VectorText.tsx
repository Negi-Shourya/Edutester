import { Fragment, type ReactNode } from 'react';

// Matches vector markup, subscript/superscript markup, and unicode
// superscript/subscript characters in a single pass.
const TOKEN_RE =
  /\\vec\{(?:[^{}]|\{[^{}]*\})*\}|_(?:\{[^{}]*\}|[A-Za-z0-9]+)|\^(?:\{[^{}]*\}|[A-Za-z0-9+-]+)|[\u00B9\u00B2\u00B3\u2070\u2071\u2074-\u207F\u2080-\u209C]/g;

const VEC_SINGLE = /^\\vec\{((?:[^{}]|\{[^{}]*\})*)\}$/;
const SUB_MARKUP = /^_\{([^{}]*)\}$/;
const SUP_MARKUP = /^\^\{([^{}]*)\}$/;

// Unicode superscript character -> base character
const SUPER_BASE: Record<string, string> = {
  '\u00B9': '1',
  '\u00B2': '2',
  '\u00B3': '3',
  '\u2070': '0',
  '\u2071': 'i',
  '\u2074': '4',
  '\u2075': '5',
  '\u2076': '6',
  '\u2077': '7',
  '\u2078': '8',
  '\u2079': '9',
  '\u207A': '+',
  '\u207B': '-',
  '\u207C': '=',
  '\u207D': '(',
  '\u207E': ')',
  '\u207F': 'n',
};

// Unicode subscript character -> base character
const SUB_BASE: Record<string, string> = {
  '\u2080': '0',
  '\u2081': '1',
  '\u2082': '2',
  '\u2083': '3',
  '\u2084': '4',
  '\u2085': '5',
  '\u2086': '6',
  '\u2087': '7',
  '\u2088': '8',
  '\u2089': '9',
  '\u2090': 'a',
  '\u2091': 'e',
  '\u2092': 'o',
  '\u2093': 'x',
  '\u2095': 'h',
  '\u2096': 'k',
  '\u2097': 'l',
  '\u2098': 'm',
  '\u2099': 'n',
  '\u209A': 'p',
  '\u209B': 's',
  '\u209C': 't',
};

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'vec'; value: string }
  | { kind: 'sub'; value: string }
  | { kind: 'sup'; value: string }
  | { kind: 'subChar'; value: string }
  | { kind: 'supChar'; value: string };

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: 'text', value: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('\\vec{')) {
      tokens.push({ kind: 'vec', value: raw });
    } else if (raw.startsWith('_{')) {
      const inner = raw.match(SUB_MARKUP)?.[1] ?? '';
      tokens.push({ kind: 'sub', value: inner });
    } else if (raw.startsWith('^')) {
      const inner = raw.startsWith('^{') ? raw.match(SUP_MARKUP)?.[1] ?? '' : raw.slice(1);
      tokens.push({ kind: 'sup', value: inner });
    } else if (raw.startsWith('_')) {
      tokens.push({ kind: 'sub', value: raw.slice(1) });
    } else if (raw in SUPER_BASE) {
      tokens.push({ kind: 'supChar', value: raw });
    } else if (raw in SUB_BASE) {
      tokens.push({ kind: 'subChar', value: raw });
    } else {
      tokens.push({ kind: 'text', value: raw });
    }
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) {
    tokens.push({ kind: 'text', value: text.slice(lastIndex) });
  }
  return tokens;
}

function renderTokens(tokens: Token[]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let pending: { kind: 'sup' | 'sub'; items: string[] } | null = null;

  const flushPending = (keyBase: string) => {
    if (pending) {
      nodes.push(
        pending.kind === 'sup' ? (
          <sup key={keyBase} className="text-[0.72em] leading-none">
            {pending.items.join('')}
          </sup>
        ) : (
          <sub key={keyBase} className="text-[0.72em] leading-none">
            {pending.items.join('')}
          </sub>
        )
      );
      pending = null;
    }
  };

  tokens.forEach((token, i) => {
    switch (token.kind) {
      case 'text':
        flushPending(`flush-${i}`);
        nodes.push(<Fragment key={i}>{token.value}</Fragment>);
        break;
      case 'vec': {
        flushPending(`flush-${i}`);
        const inner = token.value.match(VEC_SINGLE)?.[1] ?? '';
        nodes.push(<Vector key={i} content={renderText(inner)} />);
        break;
      }
      case 'sub':
        flushPending(`flush-${i}`);
        nodes.push(
          <sub key={i} className="text-[0.72em] leading-none">
            {renderText(token.value)}
          </sub>
        );
        break;
      case 'sup':
        flushPending(`flush-${i}`);
        nodes.push(
          <sup key={i} className="text-[0.72em] leading-none">
            {renderText(token.value)}
          </sup>
        );
        break;
      case 'subChar': {
        const base = SUB_BASE[token.value];
        if (pending && pending.kind === 'sub') {
          pending.items.push(base);
        } else {
          flushPending(`flush-${i}`);
          pending = { kind: 'sub', items: [base] };
        }
        break;
      }
      case 'supChar': {
        const base = SUPER_BASE[token.value];
        if (pending && pending.kind === 'sup') {
          pending.items.push(base);
        } else {
          flushPending(`flush-${i}`);
          pending = { kind: 'sup', items: [base] };
        }
        break;
      }
    }
  });
  flushPending('flush-final');
  return nodes;
}

function renderText(text: string): ReactNode {
  if (!text) return null;
  return renderTokens(tokenize(text));
}

// Renders \vec{X} markup (stored in the database) with a CSS/SVG-drawn arrow
// above the symbol, and sub/superscript markup + unicode sup/sub characters
// as proper <sub>/<sup> elements so they render identically in every font.
export default function VectorText({ text }: VectorTextProps) {
  return <>{renderText(text)}</>;
}

interface VectorTextProps {
  text: string;
}

function Vector({ content }: { content: ReactNode }) {
  return (
    <span className="vec" aria-label="vector">
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

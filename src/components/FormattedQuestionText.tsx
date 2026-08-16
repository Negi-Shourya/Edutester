import VectorText from './VectorText';

interface FormattedQuestionTextProps {
  text: string;
  className?: string;
}

interface MatchItem {
  leftLabel: string; // e.g., "A. 2s" or "A. Scurvy"
  rightLabel: string; // e.g., "IV. 1 Radial node + No nodal plane"
}

export default function FormattedQuestionText({ text, className = '' }: FormattedQuestionTextProps) {
  if (!text) return null;

  // Check if text is a "Match the following" or "Match List" type question
  const isMatchQuestion = /Match\s+(List|the|Column|LIST)/i.test(text) || (text.includes('List-I') && text.includes('List-II')) || text.includes('| Column-I');

  if (isMatchQuestion) {
    return <MatchQuestionRenderer text={text} className={className} />;
  }

  // Check if text contains Statement I and Statement II
  const isStatementQuestion = text.includes('Statement I:') && text.includes('Statement II:');
  if (isStatementQuestion) {
    return <StatementQuestionRenderer text={text} className={className} />;
  }

  // Standard multi-line rendering
  return (
    <div className={`whitespace-pre-line text-gray-900 leading-relaxed ${className}`}>
      <VectorText text={text} />
    </div>
  );
}

function MatchQuestionRenderer({ text, className }: { text: string; className: string }) {
  // Split lines
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let title = 'Match the following:';
  let col1Header = 'List - I';
  let col2Header = 'List - II';
  let footer = '';
  const matchRows: MatchItem[] = [];

  for (const line of lines) {
    if (line.toLowerCase().startsWith('match')) {
      title = line;
      continue;
    }

    if (/^choose the correct/i.test(line) || /^choose the option/i.test(line) || /^options:/i.test(line)) {
      footer = line;
      continue;
    }

    // Markdown table detection
    const matchMd = line.match(/^\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/);
    if (matchMd) {
      const left = matchMd[1].trim();
      const right = matchMd[2].trim();
      if (/^-+$/.test(left) || /^-+$/.test(right)) continue;
      if (/^(List|Column)/i.test(left)) {
        col1Header = left;
        col2Header = right;
        continue;
      }
      matchRows.push({ leftLabel: left, rightLabel: right });
      continue;
    }

    // Header line detection — check List-II first and anchor with \b so the
    // List-I pattern cannot swallow a "List-II" line.
    if (/^list\s*-\s*ii\b/i.test(line) || /^list\s*2/i.test(line) || /^column\s*-\s*ii\b/i.test(line)) {
      col2Header = line;
      continue;
    }
    if (/^list\s*-\s*i\b/i.test(line) || /^list\s*1/i.test(line) || /^column\s*-\s*i\b/i.test(line)) {
      col1Header = line;
      continue;
    }

    // Match row pattern 1: "A. Scurvy -> III. Ascorbic Acid" or "A. 2s -> IV. 1 Radial node"
    const matchArrow = line.match(/^([A-D]\.\s*.*?)\s*(?:->|→|:)\s*(.*)$/i);
    if (matchArrow) {
      matchRows.push({
        leftLabel: matchArrow[1].trim(),
        rightLabel: matchArrow[2].trim(),
      });
      continue;
    }

    // Match row pattern 2: "A. 2s" followed by "I. ..."
    const matchRoman = line.match(/^([A-D]\.\s*.*?)\s+((?:I|II|III|IV|V)\.\s*.*)$/i);
    if (matchRoman) {
      matchRows.push({
        leftLabel: matchRoman[1].trim(),
        rightLabel: matchRoman[2].trim(),
      });
      continue;
    }

    // If it's an A/B/C/D row without clear arrow
    if (/^[A-D]\./.test(line)) {
      const parts = line.split(/->|→|:\s*/);
      if (parts.length >= 2) {
        matchRows.push({
          leftLabel: parts[0].trim(),
          rightLabel: parts.slice(1).join(' : ').trim(),
        });
      } else {
        // Fallback split by double spaces or tabs
        const doubleSpaceParts = line.split(/\s{2,}/);
        if (doubleSpaceParts.length >= 2) {
          matchRows.push({
            leftLabel: doubleSpaceParts[0].trim(),
            rightLabel: doubleSpaceParts.slice(1).join(' ').trim(),
          });
        }
      }
    }
  }

  // If we successfully parsed rows, render a beautiful NTA table!
  if (matchRows.length > 0) {
    return (
      <div className={`space-y-3 my-2 ${className}`}>
        <p className="font-semibold text-gray-900">{title}</p>

        <div className="overflow-x-auto my-3 border border-gray-300 rounded-md shadow-xs max-w-xl">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f0f4f8] border-b border-gray-300 text-[#1b365d]">
                <th className="py-2.5 px-4 font-bold border-r border-gray-300 w-1/2">{col1Header}</th>
                <th className="py-2.5 px-4 font-bold w-1/2">{col2Header}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {matchRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="py-2 px-4 border-r border-gray-200 font-medium text-gray-800">
                    <VectorText text={row.leftLabel} />
                  </td>
                  <td className="py-2 px-4 font-medium text-gray-800">
                    <VectorText text={row.rightLabel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {footer && <p className="text-xs font-semibold text-gray-700 italic">{footer}</p>}
      </div>
    );
  }

  // Fallback: white-space pre-line rendering
  return (
    <div className={`whitespace-pre-line text-gray-900 leading-relaxed ${className}`}>
      <VectorText text={text} />
    </div>
  );
}

function StatementQuestionRenderer({ text, className }: { text: string; className: string }) {
  // Split into intro, Statement I, Statement II, and conclusion
  const parts = text.split(/(Statement I:|Statement II:)/g);

  return (
    <div className={`space-y-2 my-2 text-gray-900 leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part === 'Statement I:' || part === 'Statement II:') {
          return null;
        }

        const prevToken = index > 0 ? parts[index - 1] : '';

        if (prevToken === 'Statement I:') {
          return (
            <div key={index} className="p-2.5 bg-blue-50/60 border-l-4 border-[#337ab7] rounded-r text-xs sm:text-sm">
              <strong className="text-[#1b365d] block mb-0.5">Statement I:</strong>
              <span><VectorText text={part.trim()} /></span>
            </div>
          );
        }

        if (prevToken === 'Statement II:') {
          return (
            <div key={index} className="p-2.5 bg-amber-50/60 border-l-4 border-amber-500 rounded-r text-xs sm:text-sm">
              <strong className="text-amber-900 block mb-0.5">Statement II:</strong>
              <span><VectorText text={part.trim()} /></span>
            </div>
          );
        }

        // Regular text (Intro or Outro)
        const trimmed = part.trim();
        if (!trimmed) return null;

        return (
          <p key={index} className="whitespace-pre-line">
            <VectorText text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

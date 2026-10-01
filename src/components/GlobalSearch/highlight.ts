export interface HighlightSegment {
  text: string;
  isMatch: boolean;
}

interface Range {
  start: number;
  end: number;
}

// Mirrors backend matching, which is case- and diacritic-insensitive (e.g. "markovic" matches "Marković").
// "đ" has no Unicode decomposition, so it's mapped to "d" explicitly.
function normalizeChar(char: string) {
  return char
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

// Normalizes text while remembering which original index every normalized character came from,
// so matches found in the normalized string can be mapped back onto the original one.
function normalizeWithIndexMap(text: string) {
  let normalized = '';
  const indexMap: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const normalizedChar = normalizeChar(text[i]);
    normalized += normalizedChar;
    for (let j = 0; j < normalizedChar.length; j++) indexMap.push(i);
  }

  return { normalized, indexMap };
}

function mergeRanges(ranges: Range[]) {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: Range[] = [];

  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

function getMatchRanges(text: string, query: string) {
  const terms = normalizeWithIndexMap(query).normalized.split(/\s+/).filter(Boolean);
  const { normalized, indexMap } = normalizeWithIndexMap(text);
  const ranges: Range[] = [];

  for (const term of terms) {
    let from = normalized.indexOf(term);

    while (from !== -1) {
      let end = indexMap[from + term.length - 1] + 1;
      // Keep trailing combining marks (decomposed input) inside the highlighted part
      while (end < text.length && normalizeChar(text[end]) === '') end++;

      ranges.push({ start: indexMap[from], end });
      from = normalized.indexOf(term, from + term.length);
    }
  }

  return mergeRanges(ranges);
}

// Splits text into matched / unmatched segments. Each whitespace-separated query term is matched on its own.
export function splitByHighlight(text: string, query: string): HighlightSegment[] {
  const ranges = getMatchRanges(text, query);
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const { start, end } of ranges) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), isMatch: false });
    segments.push({ text: text.slice(start, end), isMatch: true });
    cursor = end;
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor), isMatch: false });

  return segments;
}

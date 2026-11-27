import { describe, expect, it } from 'vitest';

import { formatPdfAddress, formatPdfFooter, paginatePdfBlocks, splitPdfTerms } from './nalogPdfLayout';

describe('formatPdfAddress', () => {
  it('joins street and postal parts like the backend', () => {
    expect(formatPdfAddress('Ilica 1', '10000', 'Zagreb', 'HR')).toBe('Ilica 1, 10000, Zagreb, HR');
  });

  it('drops blank parts', () => {
    expect(formatPdfAddress('', '10000', 'Zagreb', 'HR')).toBe('10000, Zagreb, HR');
    expect(formatPdfAddress('Ilica 1', undefined, undefined, 'HR')).toBe('Ilica 1, HR');
    expect(formatPdfAddress(' ', undefined, undefined, '')).toBe('');
  });
});

describe('formatPdfFooter', () => {
  it('puts every line on one row', () => {
    expect(formatPdfFooter('IBAN HR12\nMBS 0800')).toBe('IBAN HR12 | MBS 0800');
  });
});

describe('splitPdfTerms', () => {
  it('trims each line and keeps blank ones', () => {
    expect(splitPdfTerms(' 1. Prvo \n\n2. Drugo')).toEqual(['1. Prvo', '', '2. Drugo']);
  });

  it('returns no lines for blank terms', () => {
    expect(splitPdfTerms('  \n ')).toEqual([]);
  });
});

describe('paginatePdfBlocks', () => {
  it('keeps everything on one page when it fits', () => {
    expect(paginatePdfBlocks([{ height: 40 }, { height: 50 }], 100)).toEqual([[0, 1]]);
  });

  it('moves a block that does not fit to the next page', () => {
    expect(paginatePdfBlocks([{ height: 60 }, { height: 50 }, { height: 30 }], 100)).toEqual([[0], [1, 2]]);
  });

  it('keeps a title with the block after it', () => {
    expect(paginatePdfBlocks([{ height: 70 }, { height: 20, keepWithNext: true }, { height: 20 }], 100)).toEqual([
      [0],
      [1, 2],
    ]);
  });

  it('gives an oversized block its own page', () => {
    expect(paginatePdfBlocks([{ height: 30 }, { height: 150 }, { height: 10 }], 100)).toEqual([[0], [1], [2]]);
  });

  it('returns one empty page for no blocks', () => {
    expect(paginatePdfBlocks([], 100)).toEqual([[]]);
  });
});

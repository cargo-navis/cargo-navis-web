import { describe, expect, it } from 'vitest';

import { splitByHighlight } from './highlight';

const hit = (text: string) => ({ text, isMatch: true });
const miss = (text: string) => ({ text, isMatch: false });

describe('splitByHighlight', () => {
  it('splits around a match', () => {
    expect(splitByHighlight('Ivan Horvat', 'hor')).toEqual([miss('Ivan '), hit('Hor'), miss('vat')]);
  });

  it('marks the whole text', () => {
    expect(splitByHighlight('KC 123-AB', 'kc 123-ab')).toEqual([hit('KC'), miss(' '), hit('123-AB')]);
  });

  it('ignores case and diacritics both ways', () => {
    expect(splitByHighlight('Marković', 'markovic')).toEqual([hit('Marković')]);
    expect(splitByHighlight('Markovic', 'MARKOVIĆ')).toEqual([hit('Markovic')]);
    expect(splitByHighlight('Šimić Žarko', 'simic zar')).toEqual([hit('Šimić'), miss(' '), hit('Žar'), miss('ko')]);
  });

  it('maps đ to d', () => {
    expect(splitByHighlight('Đurđević', 'durdev')).toEqual([hit('Đurđev'), miss('ić')]);
    expect(splitByHighlight('Prijevoz Đuro', 'đuro')).toEqual([miss('Prijevoz '), hit('Đuro')]);
  });

  it('keeps combining marks of decomposed text in the match', () => {
    const decomposed = 'Ivić d.o.o.';
    expect(splitByHighlight(decomposed, 'ivic')).toEqual([hit('Ivić'), miss(' d.o.o.')]);
  });

  it('marks every occurrence', () => {
    expect(splitByHighlight('Ana Anić', 'an')).toEqual([hit('An'), miss('a '), hit('An'), miss('ić')]);
    expect(splitByHighlight('banana', 'ana')).toEqual([miss('b'), hit('ana'), miss('na')]);
  });

  it('matches each term on its own, in any order', () => {
    expect(splitByHighlight('Ivan Horvat', '  horvat   ivan ')).toEqual([hit('Ivan'), miss(' '), hit('Horvat')]);
  });

  it('merges overlapping and touching matches', () => {
    expect(splitByHighlight('Marko', 'mar ark')).toEqual([hit('Mark'), miss('o')]);
    expect(splitByHighlight('abcd', 'ab cd')).toEqual([hit('abcd')]);
  });

  it('leaves text without a match whole', () => {
    expect(splitByHighlight('Ivan Horvat', 'zagreb')).toEqual([miss('Ivan Horvat')]);
  });

  it('handles an empty query or text', () => {
    expect(splitByHighlight('Ivan', '')).toEqual([miss('Ivan')]);
    expect(splitByHighlight('Ivan', '   ')).toEqual([miss('Ivan')]);
    expect(splitByHighlight('', 'ivan')).toEqual([]);
  });
});

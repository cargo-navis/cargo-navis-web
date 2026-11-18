import { describe, expect, it } from 'vitest';

import { initials } from './initials';

describe('initials', () => {
  it('takes the first letter of two words', () => {
    expect(initials('Ivan Horvat')).toBe('IH');
    expect(initials('  ivan   horvat  ')).toBe('IH');
    expect(initials('Željko Đurić Šimić')).toBe('ŽĐ');
    expect(initials('Ana')).toBe('A');
    expect(initials('')).toBe('');
  });
});

import { describe, expect, it } from 'vitest';

import { roundLdmValue } from './math';

describe('roundLdmValue', () => {
  it.each([
    [0, 0],
    [2.4, 2.4],
    [1.234, 1.23],
    [1.236, 1.24],
    [0.1 + 0.2, 0.3],
    [13.6, 13.6],
  ])('%f → %f', (value, rounded) => expect(roundLdmValue(value)).toBe(rounded));
});

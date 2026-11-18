import { describe, expect, it } from 'vitest';

import { driverTone, driverToneClasses, fnv1a, MISSING_DRIVER_CLASSES } from './driverTone';

describe('driverTone', () => {
  it('is FNV-1a (32-bit)', () => {
    // Reference vectors from the FNV spec.
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
    expect(fnv1a('foobar')).toBe(0xbf9cf968);
  });

  it('maps an id to one of 5 tones, always the same', () => {
    const id = '3f2b9c1e-8a4d-4c1b-9e7a-2d6f5a1b0c9e';
    expect(driverTone(id)).toBe(driverTone(id));
    expect(driverTone('')).toBe(2); // 0x811c9dc5 % 5 = 1
    expect(driverTone('a')).toBe(1); // 0xe40c292c % 5 = 0
  });

  it('spreads ids over all tones', () => {
    const tones = new Set(Array.from({ length: 200 }, (_, i) => driverTone(`driver-${i}`)));
    expect([...tones].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('has a look for a missing driver', () => {
    expect(driverToneClasses(null)).toBe(MISSING_DRIVER_CLASSES);
    expect(driverToneClasses('a').avatar).toBe('bg-driver-1-soft text-driver-1-ink');
  });
});

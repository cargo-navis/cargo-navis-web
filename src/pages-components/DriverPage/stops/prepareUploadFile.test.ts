import { describe, expect, it } from 'vitest';

import { getScaledDimensions, shouldCompressImage } from './prepareUploadFile';

const MB = 1024 * 1024;

describe('shouldCompressImage', () => {
  it('true for 4 MB jpeg', () => {
    expect(shouldCompressImage({ type: 'image/jpeg', size: 4 * MB })).toBe(true);
  });

  it('false for 500 KB png', () => {
    expect(shouldCompressImage({ type: 'image/png', size: 500 * 1024 })).toBe(false);
  });

  it('false for pdf', () => {
    expect(shouldCompressImage({ type: 'application/pdf', size: 4 * MB })).toBe(false);
  });

  it('false for gif', () => {
    expect(shouldCompressImage({ type: 'image/gif', size: 4 * MB })).toBe(false);
  });
});

describe('getScaledDimensions', () => {
  it('scales landscape 4032x3024 to 2000x1500', () => {
    expect(getScaledDimensions(4032, 3024)).toEqual({ width: 2000, height: 1500 });
  });

  it('scales portrait 3024x4032 to 1500x2000', () => {
    expect(getScaledDimensions(3024, 4032)).toEqual({ width: 1500, height: 2000 });
  });

  it('keeps 800x600 unchanged', () => {
    expect(getScaledDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

import { describe, expect, it } from 'vitest';

import { fileDisplayName } from './file';

describe('fileDisplayName', () => {
  it('drops storage UUID prefixes', () => {
    expect(
      fileDisplayName(
        '9fd85cdb-23a5-4289-bfff-e11aad1950a2-5b31d8df-5781-4d52-8170-1cab0e0543ba-21729-02111126-HR-Bomark-Pak-261113132922.pdf'
      )
    ).toBe('21729-02111126-HR-Bomark-Pak-261113132922.pdf');
  });

  it('keeps plain names', () => {
    expect(fileDisplayName('CMR-2052.jpg')).toBe('CMR-2052.jpg');
  });
});

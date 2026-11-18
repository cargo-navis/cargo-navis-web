import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('keeps a legacy font size next to a text colour', () => {
    expect(cn('text-legacy-xs', 'text-dark-800')).toBe('text-legacy-xs text-dark-800');
  });

  it('lets a later legacy font size win', () => {
    expect(cn('text-legacy-xs', 'text-legacy-s')).toBe('text-legacy-s');
    expect(cn('text-legacy-xs', 'text-sm')).toBe('text-sm');
  });

  it('treats legacy radii as radii', () => {
    expect(cn('rounded-legacy-l', 'rounded-xl')).toBe('rounded-xl');
    expect(cn('rounded-t-legacy-s', 'rounded-t-lg')).toBe('rounded-t-lg');
  });
});

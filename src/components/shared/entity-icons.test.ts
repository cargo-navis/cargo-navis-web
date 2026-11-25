import { describe, expect, it } from 'vitest';

import { ENTITY_ICON } from './entity-icons';

describe('ENTITY_ICON', () => {
  it('never gives a klijent and a podvozar the same icon', () => {
    expect(ENTITY_ICON.client).not.toBe(ENTITY_ICON.contractor);
    expect(ENTITY_ICON.company).not.toBe(ENTITY_ICON.client);
  });

  it('shows the podvozar icon on agency nalozi', () => {
    expect(ENTITY_ICON.agency).toBe(ENTITY_ICON.contractor);
  });
});

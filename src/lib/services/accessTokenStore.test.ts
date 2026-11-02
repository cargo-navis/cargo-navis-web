import { afterEach, describe, expect, it } from 'vitest';

import { accessTokenStore } from './accessTokenStore';

describe('accessTokenStore', () => {
  afterEach(() => {
    accessTokenStore.clear();
  });

  it('starts empty', () => {
    expect(accessTokenStore.get()).toBeUndefined();
  });

  it('keeps the token until cleared', () => {
    accessTokenStore.set('jwt');
    expect(accessTokenStore.get()).toBe('jwt');

    accessTokenStore.clear();
    expect(accessTokenStore.get()).toBeUndefined();
  });
});

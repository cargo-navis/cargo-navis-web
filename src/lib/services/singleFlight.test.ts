import { describe, expect, it, vi } from 'vitest';

import { createSingleFlight } from './singleFlight';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('createSingleFlight', () => {
  it('shares one pending run between concurrent callers', async () => {
    const pending = deferred<string>();
    const run = vi.fn(() => pending.promise);
    const call = createSingleFlight(run);

    const first = call();
    const second = call();
    pending.resolve('token');

    await expect(first).resolves.toBe('token');
    await expect(second).resolves.toBe('token');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('starts a new run after the previous one settled', async () => {
    const run = vi.fn(async () => 'token');
    const call = createSingleFlight(run);

    await call();
    await call();

    expect(run).toHaveBeenCalledTimes(2);
  });

  it('shares a rejection and resets afterwards', async () => {
    const pending = deferred<string>();
    const error = new Error('refresh failed');
    const run = vi.fn(() => pending.promise);
    const call = createSingleFlight(run);

    const first = call();
    const second = call();
    pending.reject(error);

    await expect(first).rejects.toBe(error);
    await expect(second).rejects.toBe(error);

    run.mockResolvedValueOnce('token');
    await expect(call()).resolves.toBe('token');
    expect(run).toHaveBeenCalledTimes(2);
  });
});

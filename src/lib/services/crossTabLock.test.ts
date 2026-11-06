import { describe, expect, it, vi } from 'vitest';

import { withCrossTabLock } from './crossTabLock';

describe('withCrossTabLock', () => {
  it('runs the callback inside the named lock', async () => {
    const locks = { request: vi.fn((_name: string, callback: () => Promise<string>) => callback()) };

    await expect(withCrossTabLock('auth-refresh', async () => 'done', locks as unknown as LockManager)).resolves.toBe(
      'done'
    );

    expect(locks.request).toHaveBeenCalledWith('auth-refresh', expect.any(Function));
  });

  it('lets a second caller run only after the first finished', async () => {
    // Minimal stand-in for the Web Locks API: one holder at a time, in order.
    let queue = Promise.resolve();
    const locks = {
      request: (_name: string, callback: () => Promise<unknown>) => {
        const run = queue.then(callback);
        queue = run.then(
          () => undefined,
          () => undefined
        );
        return run;
      },
    } as unknown as LockManager;
    const order: string[] = [];
    const task = (label: string) => async () => {
      order.push(`${label} start`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      order.push(`${label} end`);
    };

    await Promise.all([withCrossTabLock('x', task('a'), locks), withCrossTabLock('x', task('b'), locks)]);

    expect(order).toEqual(['a start', 'a end', 'b start', 'b end']);
  });

  it('runs the callback directly without the Web Locks API', async () => {
    await expect(withCrossTabLock('x', async () => 'done', undefined)).resolves.toBe('done');
  });
});

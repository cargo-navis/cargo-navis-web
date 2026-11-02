/**
 * Runs `run` while holding a lock shared by every tab of this site (Web Locks API), so tabs take turns. Runs it
 * directly where the API is missing (older browsers, the server, tests).
 */
export function withCrossTabLock<T>(
  name: string,
  run: () => Promise<T>,
  locks: LockManager | undefined = globalThis.navigator?.locks
): Promise<T> {
  // request() resolves with whatever `run` resolves with; its typing just doesn't unwrap the promise.
  return locks ? (locks.request(name, run) as Promise<T>) : run();
}

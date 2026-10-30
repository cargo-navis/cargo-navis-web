/** Wraps `run` so concurrent callers share one in-flight call; the next call after it settles runs again. */
export function createSingleFlight<T>(run: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | null = null;

  return () => {
    pending ??= run().finally(() => {
      pending = null;
    });
    return pending;
  };
}

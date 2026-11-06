export interface SingleFlight<T> {
  (): Promise<T>;
  /** The call in progress, or null when none is running. Lets others wait for it without starting a new one. */
  inFlight(): Promise<T> | null;
}

/** Wraps `run` so concurrent callers share one in-flight call; the next call after it settles runs again. */
export function createSingleFlight<T>(run: () => Promise<T>): SingleFlight<T> {
  let pending: Promise<T> | null = null;

  const call = () => {
    pending ??= run().finally(() => {
      pending = null;
    });
    return pending;
  };

  return Object.assign(call, { inFlight: () => pending });
}

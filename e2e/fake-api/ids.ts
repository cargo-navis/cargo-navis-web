/**
 * Deterministic ids that look like the backend's UUIDs. The block says which area an id belongs to, so a failing
 * request is easy to read: 1xx klijenti, 2xx podvozari, 3xx zaposlenici, 4xx vozila, 5xx nalozi, 6xx tereti,
 * 7xx stanice (vehicle stops), 8xx poštanski brojevi, 9xx ostalo.
 */
export const uuid = (n: number) => `00000000-0000-4000-a000-${String(n).padStart(12, '0')}`;

let created = 10_000;

/** A fresh id for something a handler creates (counts up from 10001 in every test). */
export const newId = () => uuid(++created);

/** Called by FakeApi for each test, so created ids don't depend on which tests ran before in the worker. */
export const resetIds = () => {
  created = 10_000;
};

import type { Db } from './db';

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** A browser request to /api or /auth, as the handlers see it. */
export interface FakeRequest {
  method: Method;
  /** Pathname only, e.g. `/api/shipments/abc`. */
  path: string;
  /** `:name` segments of the matched route. */
  params: Record<string, string>;
  query: URLSearchParams;
  /** Parsed JSON body; `undefined` for no body or multipart (see `isMultipart`). */
  body: any;
  isMultipart: boolean;
  headers: Record<string, string>;
}

export interface Reply {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export type Handler = (request: FakeRequest, db: Db) => Reply | Promise<Reply>;

export interface RouteDef {
  method: Method;
  /** Express-style: `/api/shipments/:id`. Matched against the whole pathname. */
  path: string;
  handler: Handler;
}

export const route = (method: Method, path: string, handler: Handler): RouteDef => ({ method, path, handler });

// The backend wraps every /api answer: { data, status: 'success' } (backendService returns `data`).
export const ok = (data: unknown, status = 200): Reply => ({ status, body: { data, status: 'success' } });

export const noContent = (): Reply => ({ status: 204 });

/** The error body the app reads: `errorCode` (stop actions), `message[0]` (uploads), `error` (employee form). */
export const fail = (status: number, message = 'E2E fake error', errorCode?: string): Reply => ({
  status,
  body: { status: 'error', errorCode, error: message, message: [message] },
});

export const notFound = (what: string) => fail(404, `${what} not found`, 'NOT_FOUND');

/** The paginated envelope (`PaginatedResponse`); `page` is 1-based like the API. */
export function paginated<T>(items: T[], query: URLSearchParams, defaultSize = 20): Reply {
  const size = Number(query.get('size') ?? defaultSize);
  const currentPage = Number(query.get('page') ?? 1);
  const start = (currentPage - 1) * size;
  return {
    status: 200,
    body: {
      data: items.slice(start, start + size),
      currentPage,
      pageSize: size,
      totalElements: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / size)),
      status: 'success',
    },
  };
}

/** Compiles `/api/x/:id` into a matcher returning the params, or null. */
export function compilePath(path: string): (pathname: string) => Record<string, string> | null {
  const names: string[] = [];
  const pattern = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:(\w+)/g, (_, name) => {
    names.push(name);
    return '([^/]+)';
  });
  const regex = new RegExp(`^${pattern}/?$`);
  return (pathname) => {
    const match = regex.exec(pathname);
    if (!match) return null;
    return Object.fromEntries(names.map((name, index) => [name, decodeURIComponent(match[index + 1])]));
  };
}

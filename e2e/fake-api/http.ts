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
  /** The raw body (uploads); see `formField`. */
  rawBody: Buffer | null;
  headers: Record<string, string>;
}

/**
 * A field of a multipart (FormData) body: a text field's value, or for a file field its file name. Good enough for the
 * app's uploads (`file` + `fileName`); not a general parser.
 */
export function formField(request: FakeRequest, name: string): string | undefined {
  if (!request.rawBody) return undefined;
  const text = request.rawBody.toString('latin1');
  const part = new RegExp(`name="${name}"(?:; filename="([^"]*)")?\\r\\n(?:[^\\r\\n]+\\r\\n)*\\r\\n([^\\r]*)`).exec(
    text
  );
  if (!part) return undefined;
  const value = part[1] ?? part[2];
  // Field values are UTF-8 („Teretni list.pdf”); latin1 kept the bytes intact.
  return Buffer.from(value, 'latin1').toString('utf8');
}

export interface Reply {
  status: number;
  /** JSON body (serialised for you). */
  body?: unknown;
  /** A non-JSON body (a PDF, an image); set `content-type` in `headers`. Wins over `body`. */
  raw?: Buffer;
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

/** A minimal valid PDF, for downloads (generate-pdf, document links). */
export const pdf = (): Reply => ({
  status: 200,
  raw: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'),
  headers: { 'content-type': 'application/pdf' },
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

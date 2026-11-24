import type { BrowserContext, Request, Route } from '@playwright/test';

import { createDb, type Db } from './db';
import { compilePath, fail, type FakeRequest, type Handler, type Method, type Reply, type RouteDef } from './http';
import { routes as allRoutes } from './routes';

export type { Db } from './db';
export * from './http';

interface Override {
  method: Method;
  matches: (pathname: string) => Record<string, string> | null;
  handler: Handler;
  /** Left uses; Infinity = until the test ends. */
  times: number;
}

export interface RecordedRequest {
  method: Method;
  path: string;
  query: URLSearchParams;
  body: any;
}

interface OverrideOptions {
  /** Only the next n matching requests; then the normal handler answers again. */
  times?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The fake backend (e2e/README.md). Every /api and /auth request from the browser is answered here, in the test
 * process, from `db`: per-test data seeded from e2e/fake-api/areas. Handlers change `db`, so a created nalog shows up in
 * the list afterwards. Tests read and change `db` directly, and override single endpoints:
 *
 *   fakeApi.fail('GET', '/api/shipments');            // 500 → the error state
 *   fakeApi.empty('GET', '/api/fleet');               // [] or an empty page
 *   fakeApi.delay('GET', '/api/shipments', 2_000);    // slow response → loading state
 *   fakeApi.on('POST', '/api/shipments', () => fail(422, 'Bad'), { times: 1 });
 *
 * A request without a handler gets a 501 and fails the test when it ends (see `unhandled`), so every response a test
 * sees is deliberate.
 */
export class FakeApi {
  readonly db: Db;
  readonly requests: RecordedRequest[] = [];
  readonly unhandled: string[] = [];
  private readonly routes: { def: RouteDef; matches: ReturnType<typeof compilePath> }[];
  private overrides: Override[] = [];

  constructor(db: Db = createDb(), routes: RouteDef[] = allRoutes) {
    this.db = db;
    this.routes = routes.map((def) => ({ def, matches: compilePath(def.path) }));
  }

  async install(context: BrowserContext) {
    await context.route(
      (url) => /^\/(api|auth)\//.test(url.pathname),
      (route) => this.handle(route)
    );
  }

  /** Answers `method path` with `reply` (a fixed reply or a handler) instead of the normal handler. Latest wins. */
  on(method: Method, path: string, reply: Reply | Handler, { times = Infinity }: OverrideOptions = {}) {
    const handler: Handler = typeof reply === 'function' ? reply : () => reply;
    this.overrides.unshift({ method, matches: compilePath(path), handler, times });
  }

  fail(method: Method, path: string, status = 500, options?: OverrideOptions) {
    this.on(method, path, fail(status, `E2E: ${method} ${path} failed`), options);
  }

  /** The normal answer with its list emptied: `[]`, or a page with no items. */
  empty(method: Method, path: string, options?: OverrideOptions) {
    this.on(
      method,
      path,
      async (request, db) => {
        const reply = await this.normalHandler(request)!(request, db);
        const body = reply.body as { data?: unknown; totalElements?: number } | undefined;
        if (body && 'totalElements' in body) {
          return { ...reply, body: { ...body, data: [], totalElements: 0, totalPages: 1 } };
        }
        return { ...reply, body: { ...body, data: [] } };
      },
      options
    );
  }

  /** The normal answer, `ms` later. */
  delay(method: Method, path: string, ms: number, options?: OverrideOptions) {
    this.on(
      method,
      path,
      async (request, db) => {
        await sleep(ms);
        return this.normalHandler(request)!(request, db);
      },
      options
    );
  }

  /** Requests that reached the fake API so far, optionally filtered (`path` may use `:params`). */
  calls(method?: Method, path?: string): RecordedRequest[] {
    const matches = path ? compilePath(path) : undefined;
    return this.requests.filter(
      (request) => (!method || request.method === method) && (!matches || matches(request.path))
    );
  }

  private normalHandler(request: FakeRequest): Handler | undefined {
    for (const { def, matches } of this.routes) {
      if (def.method !== request.method) continue;
      const params = matches(request.path);
      if (params) {
        request.params = params;
        return def.handler;
      }
    }
    return undefined;
  }

  private async handle(route: Route) {
    const request = toFakeRequest(route.request());
    this.requests.push({ method: request.method, path: request.path, query: request.query, body: request.body });

    let handler: Handler | undefined;
    const override = this.overrides.find(
      (item) => item.method === request.method && item.times > 0 && item.matches(request.path)
    );
    if (override) {
      override.times -= 1;
      request.params = override.matches(request.path)!;
      handler = override.handler;
    } else {
      handler = this.normalHandler(request);
    }

    if (!handler) {
      const line = `${request.method} ${request.path}${request.query.size ? `?${request.query}` : ''}`;
      this.unhandled.push(line);
      await route.fulfill({
        status: 501,
        json: { status: 'error', message: [`E2E fake API: no handler for ${line}`] },
      });
      return;
    }

    let reply: Reply;
    try {
      reply = await handler(request, this.db);
    } catch (error) {
      this.unhandled.push(`${request.method} ${request.path} threw: ${(error as Error).message}`);
      reply = fail(500, (error as Error).message);
    }

    await route
      .fulfill({
        status: reply.status,
        headers: { 'content-type': 'application/json', ...reply.headers },
        body: reply.body === undefined ? '' : JSON.stringify(reply.body),
      })
      // The page may have navigated away (or the test ended) while a delayed reply was waiting.
      .catch(() => undefined);
  }
}

function toFakeRequest(request: Request): FakeRequest {
  const url = new URL(request.url());
  const headers = request.headers();
  const isMultipart = (headers['content-type'] ?? '').startsWith('multipart/');
  let body: unknown;
  if (!isMultipart) {
    try {
      body = request.postDataJSON() ?? undefined;
    } catch {
      body = request.postData() ?? undefined;
    }
  }
  return {
    method: request.method() as Method,
    path: url.pathname,
    params: {},
    query: url.searchParams,
    body,
    isMultipart,
    headers,
  };
}

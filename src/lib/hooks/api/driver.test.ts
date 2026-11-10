import { describe, expect, it } from 'vitest';

import type { PaginatedResponse } from '@/lib/api/pagination.d';

import { flattenPages } from './driver';

function page(currentPage: number, ids: string[]): PaginatedResponse<{ id: string }> {
  return {
    data: ids.map((id) => ({ id })),
    currentPage,
    pageSize: ids.length,
    totalElements: 0,
    totalPages: 0,
    status: 'success',
  };
}

describe('flattenPages', () => {
  it('joins the pages in order', () => {
    const data = { pages: [page(1, ['a', 'b']), page(2, ['c'])], pageParams: [1, 2] };
    expect(flattenPages(data).map(({ id }) => id)).toEqual(['a', 'b', 'c']);
  });

  it('drops items a later page repeats after new items shifted the list', () => {
    // A new item arrived on top between the two loads, so page 2 starts with "b" again.
    const data = { pages: [page(1, ['a', 'b']), page(2, ['b', 'c'])], pageParams: [1, 2] };
    expect(flattenPages(data).map(({ id }) => id)).toEqual(['a', 'b', 'c']);
  });
});

import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  completeDriverStop,
  deleteDriverStopFile,
  getDriverAccount,
  getDriverShipment,
  getDriverShipments,
  getDriverStops,
  uncompleteDriverStop,
  uploadDriverStopFile,
} from '@/lib/api/driver';
import type { PaginatedResponse } from '@/lib/api/pagination.d';

const QUERY_KEY = 'driver';
const STOPS_QUERY_KEY = [QUERY_KEY, 'stops'];
// The order list and every order detail; one key prefix refreshes both.
const SHIPMENTS_QUERY_KEY = [QUERY_KEY, 'shipments'];
const STOPS_REFETCH_INTERVAL = 60 * 1000;

function getNextPage({ currentPage, totalPages }: PaginatedResponse<unknown>) {
  return currentPage < totalPages ? currentPage + 1 : undefined;
}

/**
 * The loaded pages as one list. A page loaded after new items were added on top starts with items the previous page
 * already had (pages are page/size, not cursors), so repeated ids are dropped; the next refetch lines the pages up.
 */
export function flattenPages<T extends { id: string }>(data: InfiniteData<PaginatedResponse<T>>): T[] {
  const seenIds = new Set<string>();
  return data.pages
    .flatMap((page) => page.data)
    .filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
}

export function useDriverAccount(options: { enabled: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'account'],
    queryFn: getDriverAccount,
    enabled: options.enabled,
  });
}

/** The driver's stops, latest first, a page at a time. Polled, so the route stays current while the app is open. */
export function useDriverStops(options: { enabled: boolean }) {
  return useInfiniteQuery({
    queryKey: STOPS_QUERY_KEY,
    queryFn: ({ pageParam }) => getDriverStops(pageParam),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
    select: flattenPages,
    enabled: options.enabled,
    refetchInterval: STOPS_REFETCH_INTERVAL,
  });
}

/** The driver's orders, latest first, a page at a time. Refreshed on pushes and the driver's own changes, not polled. */
export function useDriverShipments(options: { enabled: boolean }) {
  return useInfiniteQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY, 'list'],
    queryFn: ({ pageParam }) => getDriverShipments(pageParam),
    initialPageParam: 1,
    getNextPageParam: getNextPage,
    select: flattenPages,
    enabled: options.enabled,
  });
}

export function useDriverShipment(shipmentId: string | null) {
  return useQuery({
    queryKey: [...SHIPMENTS_QUERY_KEY, 'detail', shipmentId],
    queryFn: () => getDriverShipment(shipmentId as string),
    enabled: !!shipmentId,
  });
}

/** Reloads everything that shows stops: the route, the order list and any order opened before. */
export function useRefreshDriverStops() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: STOPS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: SHIPMENTS_QUERY_KEY }),
    ]);
}

export function useCompleteDriverStop() {
  const refreshStops = useRefreshDriverStops();
  return useMutation({
    mutationFn: ({ stopId }: { stopId: string }) => completeDriverStop(stopId),
    onSuccess: refreshStops,
  });
}

export function useUncompleteDriverStop() {
  const refreshStops = useRefreshDriverStops();
  return useMutation({
    mutationFn: ({ stopId }: { stopId: string }) => uncompleteDriverStop(stopId),
    onSuccess: refreshStops,
  });
}

export function useUploadDriverStopFile() {
  const refreshStops = useRefreshDriverStops();
  return useMutation({
    mutationFn: ({ stopId, file, fileName }: { stopId: string; file: File; fileName?: string }) =>
      uploadDriverStopFile(stopId, file, fileName),
    onSuccess: refreshStops,
  });
}

export function useDeleteDriverStopFile() {
  const refreshStops = useRefreshDriverStops();
  return useMutation({
    mutationFn: ({ stopId, documentId }: { stopId: string; documentId: string }) =>
      deleteDriverStopFile(stopId, documentId),
    onSuccess: refreshStops,
  });
}

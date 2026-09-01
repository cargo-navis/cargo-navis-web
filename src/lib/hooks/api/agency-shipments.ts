import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  convertShipmentToAgency,
  convertShipmentToRegular,
  type ConvertToAgencyData,
  createAgencyShipment,
  type CreateAgencyShipmentData,
  deleteAgencyShipment,
  type PaginatedResponse,
  type Shipment,
  updateAgencyShipment,
  type UpdateAgencyShipmentData,
} from '@/lib/api';

import { getShipmentsListPage } from './shipments';

/**
 * Agency shipments live under their own resource but share the caches of the
 * regular ones: they show up in the same `['shipments']` list and are read
 * through `useShipment` under `['shipment', id]`.
 *
 * Reads go through `useShipment(id, { isAgency: true })` — there is no separate
 * query hook here.
 */
export function useCreateAgencyShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgencyShipmentData) => createAgencyShipment(data),
    onSuccess: () => {
      // Same reasoning as useCreateShipment: the new shipment lands on page 1
      // and shifts every later page by one row.
      queryClient.removeQueries({
        queryKey: ['shipments'],
        predicate: (q) => getShipmentsListPage(q.queryKey) > 1,
      });
      return queryClient.invalidateQueries({
        queryKey: ['shipments'],
        predicate: (q) => getShipmentsListPage(q.queryKey) === 1,
      });
    },
  });
}

export function useUpdateAgencyShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAgencyShipmentData & { id: string }) => updateAgencyShipment(id, data),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(['shipment', variables.id], updated);

      // Cargo edits can rewrite vehicle stops on the backend, and the list rows
      // carry both the client-side and the contractor-side price.
      void queryClient.removeQueries({ queryKey: ['shipments'] });
      void queryClient.invalidateQueries({ queryKey: ['vehicleStops'], refetchType: 'all' });

      return queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
    },
  });
}

export function useDeleteAgencyShipment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    // Deletes the child along with the parent, so only the parent row has to be
    // dropped from the cached list.
    mutationFn: () => deleteAgencyShipment(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['shipment', id] });

      queryClient.setQueriesData<PaginatedResponse<Shipment>>({ queryKey: ['shipments'] }, (data) => {
        if (!data) return data;
        const filtered = data.data.filter((s) => s.id !== id);
        if (filtered.length === data.data.length) return data;
        return { ...data, data: filtered, totalElements: Math.max(0, data.totalElements - 1) };
      });
    },
  });
}

/**
 * Both conversions keep the shipment id — only its type changes — so the
 * cached shipment is replaced with the response rather than removed.
 */
function useConvertShipment<TVariables extends { id: string }>(
  mutationFn: (variables: TVariables) => Promise<Shipment>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (converted, { id }) => {
      queryClient.setQueryData(['shipment', id], converted);

      void queryClient.removeQueries({ queryKey: ['shipments'] });
      void queryClient.invalidateQueries({ queryKey: ['vehicleStops'], refetchType: 'all' });

      return queryClient.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}

/** Creates the child shipment for the external carrier. */
export function useConvertShipmentToAgency() {
  return useConvertShipment(({ id, ...data }: ConvertToAgencyData & { id: string }) =>
    convertShipmentToAgency(id, data)
  );
}

/** Deletes the child shipment; the cargo stays on the parent. */
export function useConvertShipmentToRegular() {
  return useConvertShipment(({ id }: { id: string }) => convertShipmentToRegular(id));
}

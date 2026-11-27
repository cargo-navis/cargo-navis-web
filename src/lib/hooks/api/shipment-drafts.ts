import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createShipmentDraft,
  deleteShipmentDraft,
  getShipmentDraft,
  getShipmentDrafts,
  ShipmentDraft,
} from '@/lib/api';

/** While a PDF is being read: the list reloads itself this often, in case the push doesn't reach this tab. */
const DRAFTS_POLL_MS = 5000;

export function useShipmentDrafts() {
  return useQuery({
    queryKey: ['shipment-drafts'],
    queryFn: getShipmentDrafts,
    refetchInterval: (query) =>
      query.state.data?.some((draft) => draft.status === 'PENDING_EXTRACTION' || draft.status === 'PROCESSING')
        ? DRAFTS_POLL_MS
        : false,
  });
}

export function useShipmentDraft(id?: string) {
  return useQuery({
    queryKey: ['shipment-draft', id],
    queryFn: async () => getShipmentDraft(id as string),
    enabled: !!id,
  });
}

export function useCreateShipmentDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShipmentDraft,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['shipment-drafts'] });
    },
  });
}

export function useDeleteShipmentDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShipmentDraft(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['shipment-draft', id] });

      queryClient.setQueryData<ShipmentDraft[]>(['shipment-drafts'], (data) => {
        if (!data) return data;
        return data.filter((d) => d.id !== id);
      });
    },
  });
}

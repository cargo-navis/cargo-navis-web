import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  type ClientNotificationEmail,
  createClient,
  createContractor,
  deleteClient,
  deleteContractor,
  updateClient,
  updateContractor,
} from '@/lib/api';

import { fromClient, fromContractor, type Partner, type PartnerKind } from './partners';

const QUERY_KEY: Record<PartnerKind, string> = { client: 'clients', contractor: 'contractors' };

/** Delete any partner of this kind (the list deletes per row; today's hooks are per id). */
export function useDeletePartner(kind: PartnerKind) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => (kind === 'client' ? deleteClient(id) : deleteContractor(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY[kind]], type: 'all' }),
  });
}

export interface PartnerPayload {
  name: string;
  taxId: string;
  termsOfPayment: number | null;
  addressName: string;
  addressPostalCodeId: string;
  /** New client: its first notification contact; contractor: its email. Ignored when editing a client. */
  email: string;
}

/** What a save resolves with. The response body is not relied on: `id` falls back to the edited id ('' when a create
 * returned nothing), `partner` is null without a body. */
export interface SavedPartner {
  id: string;
  name: string;
  partner: Partner | null;
}

/** Create (no id) or update a partner with today's calls. */
export function useSavePartner(kind: PartnerKind, id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PartnerPayload): Promise<SavedPartner> => {
      const result = (partner: Partner | null): SavedPartner => ({
        id: partner?.id || id || '',
        name: partner?.name || payload.name,
        partner,
      });
      const base = {
        name: payload.name,
        taxId: payload.taxId,
        // Today's forms send 0 for „no terms”.
        termsOfPayment: payload.termsOfPayment ?? 0,
        addressName: payload.addressName,
        addressPostalCodeId: payload.addressPostalCodeId,
      };
      if (kind === 'client') {
        if (id) {
          // Omitting notificationEmails keeps the client's contacts (they are edited on the client page).
          const saved = await updateClient(id, base);
          return result(saved ? fromClient(saved) : null);
        }
        const notificationEmails: ClientNotificationEmail[] = payload.email
          ? [{ email: payload.email, alwaysNotify: false }]
          : [];
        const created = await createClient({ ...base, notificationEmails });
        return result(created ? fromClient(created) : null);
      }
      const contractor = { ...base, email: payload.email || undefined };
      const saved = id ? await updateContractor(id, contractor) : await createContractor(contractor);
      return result(saved ? fromContractor(saved) : null);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY[kind]], type: 'all' }),
  });
}

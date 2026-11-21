/**
 * Agency teret status, set by hand (labs /quick-look „Nalog: Agencijski”, /order-route, /order parts.tsx): one save path
 * for the Nalog detail's teret badge, the quick look (per teret and per stop) and the Nalozi row menu.
 *
 * Saving: the per-cargo PATCH `/api/shipments/{id}/cargo/{cargoId}` through `useUpdateCargo` (Nalog detail's badge
 * menu since before the redesign), with only `{ id, loadStatus }`. The backend reads every other field as absent and
 * keeps it (FieldState), so it cannot touch other cargo or other fields — unlike the agency shipment PATCH, which
 * treats `cargo` as the full list and deletes what's missing. Several tereti (a stop) = one call per teret, in order.
 */

import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Cargo, PaginatedResponse, Shipment } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';
import { useUpdateCargo } from '@/lib/hooks';
import { daysFromToday } from '@/lib/utils/date';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

import { AGENCY_STATUS_LABEL, agencyStatusBadgeLabel, LOAD_STATUSES } from './cargo';

export interface CargoStatusChange {
  cargoId: string;
  status: LoadStatus;
}

const statusOf = (cargo: Cargo) => cargo.loadStatus ?? LoadStatus.NotYetLoaded;

/**
 * `set(changes, toast?)`: saves the changed tereti one by one (unchanged ones are skipped), the list and the Nalog
 * detail updated at once and rolled back (then refetched) if a call fails. Default toast „Status tereta: Utovaren”.
 */
export function useSetCargoStatus(shipment: Pick<Shipment, 'id' | 'cargo'>) {
  const queryClient = useQueryClient();
  const { mutateAsync: updateCargo } = useUpdateCargo(shipment.id);
  const [isPending, setPending] = React.useState(false);

  const set = React.useCallback(
    async (changes: CargoStatusChange[], toast?: { title: string; description?: string }) => {
      const current = new Map(shipment.cargo.map((cargo) => [cargo.id, statusOf(cargo)]));
      const pending = changes.filter(
        (change) => current.has(change.cargoId) && current.get(change.cargoId) !== change.status
      );
      if (!pending.length) return;

      const next = new Map(pending.map((change) => [change.cargoId, change.status]));
      const patchCargo = (cargo: Cargo[] | undefined) =>
        cargo?.map((item) => {
          const status = next.get(item.id);
          return status ? { ...item, loadStatus: status } : item;
        });
      const listFilter = { queryKey: ['shipments'] };
      const detailKey = ['shipment', shipment.id];
      const cancel = () =>
        Promise.all([queryClient.cancelQueries(listFilter), queryClient.cancelQueries({ queryKey: detailKey })]);

      await cancel();
      const listSnapshot = queryClient.getQueriesData<PaginatedResponse<Shipment>>(listFilter);
      const detailSnapshot = queryClient.getQueryData<Shipment>(detailKey);
      const applyOptimistic = () => {
        queryClient.setQueriesData<PaginatedResponse<Shipment>>(listFilter, (data) =>
          data && Array.isArray(data.data)
            ? {
                ...data,
                data: data.data.map((row) =>
                  row.id === shipment.id ? { ...row, cargo: patchCargo(row.cargo) ?? row.cargo } : row
                ),
              }
            : data
        );
        queryClient.setQueryData<Shipment>(
          detailKey,
          (data) => data && { ...data, cargo: patchCargo(data.cargo) ?? data.cargo }
        );
      };
      applyOptimistic();

      setPending(true);
      try {
        for (const [index, change] of pending.entries()) {
          // Only the id and the status: the per-cargo PATCH leaves every other field (and every other teret) as is.
          await updateCargo({ id: change.cargoId, loadStatus: change.status });
          if (index < pending.length - 1) {
            // useUpdateCargo refetches after each call; a half-saved stop shouldn't flash in between.
            await cancel();
            applyOptimistic();
          }
        }
        showSuccessToast(toast ?? { title: `Status tereta: ${AGENCY_STATUS_LABEL[pending[0].status]}` });
      } catch (error) {
        console.error(error);
        listSnapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
        queryClient.setQueryData(detailKey, detailSnapshot);
        // Some tereti may have been saved before the failing one: show what the server has.
        void queryClient.invalidateQueries(listFilter);
        void queryClient.invalidateQueries({ queryKey: detailKey });
        showErrorToast({ title: 'Status tereta nije promijenjen', description: 'Pokušaj ponovno.' });
      } finally {
        setPending(false);
      }
    },
    [queryClient, shipment.cargo, shipment.id, updateCargo]
  );

  return { set, isPending };
}

/**
 * The status the dispatcher set by hand, coloured like the route (decided 2026-11-20): „Nije utovaren” grey, amber
 * „· rok prošao” once the date for the next step has passed without a mark, „Označeno: Utovaren” blue, „Označeno:
 * Istovaren” green. The „Označeno:” wording keeps it honest (set by hand, nobody tracks an agency nalog); no „Kasni”.
 * No who / when: the API doesn't keep them.
 */
export function AgencyStatusBadge({ cargo, size }: { cargo: Cargo; size?: 'sm' }) {
  const status = statusOf(cargo);
  const due = status === LoadStatus.NotYetLoaded ? cargo.loadingReadyDate : cargo.unloadingDueDate;
  const overdue = status !== LoadStatus.Unloaded && !!due && daysFromToday(due) < 0;
  const tone = overdue
    ? 'warning'
    : status === LoadStatus.Unloaded
      ? 'success'
      : status === LoadStatus.Loaded
        ? 'info'
        : 'neutral';
  return (
    <Badge size={size} tone={tone}>
      {agencyStatusBadgeLabel(status)}
      {overdue && ' · rok prošao'}
    </Badge>
  );
}

/** One teret's menu: „Status tereta (ručno)” with the three states; the trigger is the caller's (badge, button). */
export function AgencyStatusMenu({
  shipment,
  cargo,
  trigger,
  children,
  align = 'end',
  side,
}: {
  shipment: Pick<Shipment, 'id' | 'cargo'>;
  cargo: Cargo;
  /** The trigger element (Base UI `render`). */
  trigger: React.ReactElement;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const { set, isPending } = useSetCargoStatus(shipment);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isPending} render={trigger}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48" side={side}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Status tereta (ručno)</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={statusOf(cargo)}
            onValueChange={(value) => void set([{ cargoId: cargo.id, status: value as LoadStatus }])}
          >
            {LOAD_STATUSES.map((status) => (
              <DropdownMenuRadioItem key={status} value={status}>
                {AGENCY_STATUS_LABEL[status]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

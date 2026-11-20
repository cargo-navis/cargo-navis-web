/**
 * Confirming an own nalog's vehicle stop for the driver (today's ToggleStopCompletionButton rules and messages): the
 * Nalog detail's Ruta (SingleShipmentPage/RouteSection) and the quick look (list/QuickLookSheet) share it. A confirm
 * completes the whole vehicle stop (other nalozi on it too) and sends the client's email notifications, as when the
 * driver confirms.
 */

import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCompleteVehicleStop, useUncompleteVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import type { RouteStopKind, VehicleRouteStop } from '../list/routeData';

/** Disabled with the reason in a tooltip instead of failing after the click. */
export function WithReason({ reason, children }: { reason?: string; children: React.ReactElement }) {
  if (!reason) return children;
  return (
    <Tooltip>
      {/* span: disabled buttons get no hover, the tooltip anchors on the wrapper */}
      <TooltipTrigger render={<span className="inline-flex" />}>{children}</TooltipTrigger>
      <TooltipContent className="max-w-64">{reason}</TooltipContent>
    </Tooltip>
  );
}

const STOP_WORDS = {
  loading: { confirm: 'Potvrdi utovar', confirmed: 'Utovar potvrđen', undone: 'Utovar označen nedovršenim' },
  unloading: { confirm: 'Potvrdi istovar', confirmed: 'Istovar potvrđen', undone: 'Istovar označen nedovršenim' },
  // A stop with a utovar and an istovar of this nalog is one visit: confirmed together.
  both: {
    confirm: 'Potvrdi utovar i istovar',
    confirmed: 'Utovar i istovar potvrđeni',
    undone: 'Utovar i istovar označeni nedovršenima',
  },
} as const;

const wordsFor = (kinds: RouteStopKind[]) => STOP_WORDS[kinds.length > 1 ? 'both' : kinds[0]];

/** Confirm / undo a vehicle stop (today's ToggleStopCompletionButton rules and messages). */
export function useToggleStop(row: VehicleRouteStop) {
  const { stop } = row;
  const { mutateAsync: complete, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncomplete, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const words = wordsFor(row.kinds);
  const place = stop.address?.placeName ?? undefined;

  /**
   * The mutation only starts the nalog / list refetch (cargo statuses come from the server); wait for the ones on
   * screen so the button keeps loading until the timeline shows the change. cancelRefetch: false joins the refetch
   * already running instead of starting another.
   */
  async function refreshed() {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['shipment'], type: 'active' }, { cancelRefetch: false }),
        queryClient.refetchQueries({ queryKey: ['shipments'], type: 'active' }, { cancelRefetch: false }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function toggle() {
    try {
      if (stop.completedAt) {
        await uncomplete();
        await refreshed();
        showSuccessToast({ title: words.undone, description: place });
      } else {
        await complete();
        await refreshed();
        showSuccessToast({ title: words.confirmed, description: place });
      }
    } catch (error) {
      console.error(error);
      const errorCode = (error as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;
      if (errorCode === 'CARGO_NOT_YET_LOADED') {
        showErrorToast({
          title: 'Istovar nije potvrđen: teret još nije utovaren.',
          description: 'Prvo potvrdi utovar.',
        });
      } else if (errorCode === 'CARGO_STATUS_CHANGED_BY_LATER_STOP') {
        showErrorToast({
          title: 'Utovar nije poništen: teret je već istovaren.',
          description: 'Prvo poništi taj istovar.',
        });
      } else {
        showErrorToast({ title: 'Promjena nije spremljena. Pokušaj ponovno.' });
      }
    }
  }

  return { toggle, words, isPending: isCompleting || isUncompleting || isRefreshing };
}

/** „✓ Potvrdi utovar / istovar” for the next stop; disabled with the reason when the backend would refuse it. */
export function ConfirmStopButton({ row, size = 'sm' }: { row: VehicleRouteStop; size?: 'xs' | 'sm' }) {
  const { toggle, words, isPending } = useToggleStop(row);
  return (
    <WithReason reason={row.blocked}>
      <Button disabled={!!row.blocked} loading={isPending} size={size} onClick={() => void toggle()}>
        <Icon data-icon="inline-start" icon="IconCheck" size={size === 'xs' ? 'xs' : 's'} /> {words.confirm}
      </Button>
    </WithReason>
  );
}

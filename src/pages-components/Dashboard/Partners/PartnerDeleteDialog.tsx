import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useShipments } from '@/lib/hooks';
import { pluralCount } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { useDeletePartner } from './hooks';
import { normalizeSearch, type Partner, PARTNER_WORDS, type PartnerKind } from './partners';

/** The word to type for a big delete: the first word of the name („Podravka d.d.” → PODRAVKA). */
function confirmWord(name: string) {
  const first = name.trim().split(/\s+/)[0] ?? '';
  return first.replace(/[^\p{L}\p{N}-]/gu, '').toUpperCase() || name.trim().toUpperCase();
}

/**
 * Izbriši (lab /overlays/confirm: confirm-danger, „type the name when it has nalozi”). A client's nalozi are counted
 * with today's getShipments({ clientId }); a contractor's can't be yet (no transportContractorId filter), so it gets
 * the plain confirm.
 */
export function PartnerDeleteDialog({
  kind,
  partner,
  onOpenChange,
  onDeleted,
}: {
  kind: PartnerKind;
  /** Open while set. */
  partner: Partner | null;
  onOpenChange(open: boolean): void;
  onDeleted?(partner: Partner): void;
}) {
  const words = PARTNER_WORDS[kind];
  // Keep the last partner while the dialog animates out.
  const [shown, setShown] = React.useState(partner);
  if (partner && partner !== shown) setShown(partner);
  const [typed, setTyped] = React.useState('');
  const { mutateAsync: deletePartner, isPending } = useDeletePartner(kind);

  const open = !!partner;
  const {
    data: orders,
    isLoading: countLoading,
    isError: countFailed,
  } = useShipments({
    params: { clientId: shown?.id, page: 1, size: 1 },
    enabled: open && kind === 'client' && !!shown,
  });
  const isClient = kind === 'client';
  const orderCount = isClient ? (orders?.totalElements ?? 0) : 0;
  const word = shown ? confirmWord(shown.name) : '';
  // Client: wait for the nalozi count; if it can't be loaded, ask for the name anyway (never skip the big confirm).
  const counting = isClient && countLoading;
  const needsTyping = orderCount > 0 || (isClient && countFailed);
  const typedOk = !needsTyping || normalizeSearch(typed) === normalizeSearch(word);
  const canDelete = !counting && typedOk;

  async function handleDelete() {
    if (!shown || !canDelete) return;
    try {
      await deletePartner(shown.id);
      showSuccessToast({ title: `${words.one} ${shown.name} obrisan` });
      onOpenChange(false);
      onDeleted?.(shown);
    } catch {
      showErrorToast({ title: `Brisanje ${words.accusative} nije uspjelo`, description: 'Pokušaj ponovno.' });
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped('');
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon icon="IconTrash" size="m" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Izbrisati {words.accusative} {shown?.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {needsTyping ? (
              <>
                {countFailed
                  ? `Broj naloga ovog ${words.accusative} nije se učitao.`
                  : `${words.one} ima ${pluralCount(orderCount, ['nalog', 'naloga', 'naloga'])}.`}{' '}
                Ovo se ne može poništiti. Upiši <span className="font-medium text-foreground">{word}</span> za potvrdu.
              </>
            ) : counting ? (
              'Provjeravam naloge ovog klijenta…'
            ) : (
              'Ovo se ne može poništiti.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {needsTyping && (
          <Input
            aria-label="Potvrda"
            autoComplete="off"
            placeholder={word}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canDelete) void handleDelete();
            }}
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Odustani</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canDelete}
            loading={isPending}
            variant="destructive"
            onClick={() => void handleDelete()}
          >
            Izbriši {words.accusative}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useRouter } from 'next/router';

import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Icon } from '@/ui';

import {
  type Partner,
  PARTNER_WORDS,
  partnerEditHref,
  partnerHref,
  type PartnerKind,
  partnerNewOrderHref,
} from './partners';
import { copyValue } from './parts';

/**
 * Row actions (lab /partners `PartnerMenuItems`, DECISIONS §5): Otvori, Uredi, Novi nalog, Kopiraj porezni broj,
 * Izbriši. The right-click menu adds „Otvori u novom tabu” (DECISIONS §2 Lists).
 */
export function PartnerMenuItems({
  kind,
  partner,
  context,
  onDelete,
}: {
  kind: PartnerKind;
  partner: Partner;
  /** Right-click menu (ContextMenu items + „Otvori u novom tabu”). */
  context?: boolean;
  onDelete(partner: Partner): void;
}) {
  const router = useRouter();
  const Item = context ? ContextMenuItem : DropdownMenuItem;
  const Separator = context ? ContextMenuSeparator : DropdownMenuSeparator;
  const href = partnerHref(kind, partner.id);

  return (
    <>
      <Item onClick={() => void router.push(href)}>
        <Icon icon="IconExternalLink" size="s" /> Otvori
      </Item>
      {context && (
        <Item render={<a href={href} rel="noopener noreferrer" target="_blank" />}>
          <Icon icon="IconExternalLink" size="s" /> Otvori u novom tabu
        </Item>
      )}
      <Item onClick={() => void router.push(partnerEditHref(kind, partner.id))}>
        <Icon icon="IconPencil" size="s" /> Uredi
      </Item>
      <Item onClick={() => void router.push(partnerNewOrderHref(kind, partner.id))}>
        <Icon icon="IconPlus" size="s" /> {PARTNER_WORDS[kind].newOrder}
      </Item>
      <Item disabled={!partner.taxId} onClick={() => void copyValue(partner.taxId, 'Porezni broj')}>
        <Icon icon="IconCopy" size="s" /> Kopiraj porezni broj
      </Item>
      <Separator />
      <Item variant="destructive" onClick={() => onDelete(partner)}>
        <Icon icon="IconTrash" size="s" /> Izbriši
      </Item>
    </>
  );
}

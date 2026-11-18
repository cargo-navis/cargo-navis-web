import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { dimmed, TableLoadingRow } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDelayedFlag, useScrollRestoration } from '@/lib/hooks';
import { pluralCount } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import { PartnerDeleteDialog } from './PartnerDeleteDialog';
import { PartnerMenuItems } from './PartnerMenu';
import {
  normalizeSearch,
  type Partner,
  PARTNER_WORDS,
  partnerHref,
  type PartnerKind,
  partnerSearchText,
} from './partners';
import { CopyValue, Dash, formatTerms, PlaceLine } from './parts';

const COLUMNS = 5;

/**
 * Klijenti / Kontraktori list (lab /partners „Popis”, DECISIONS §5): no avatar, place under the name, ⋯ + right-click,
 * search over name / place / tax id / email, all rows at once (today's API has no paging), sorted by name.
 */
export function PartnerList({
  kind,
  partners,
  isLoading,
  isError,
  isFetching,
  onRetry,
}: {
  kind: PartnerKind;
  partners: Partner[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry(): void;
}) {
  const words = PARTNER_WORDS[kind];
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [toDelete, setToDelete] = React.useState<Partner | null>(null);
  const showFetching = useDelayedFlag(isFetching && !isLoading);
  const all = partners ?? [];
  const isEmpty = !isLoading && !isError && all.length === 0;
  useScrollRestoration(kind === 'client' ? 'clients' : 'contractors', { isReady: all.length > 0 });

  const shown = React.useMemo(() => {
    const needle = normalizeSearch(query);
    return all
      .filter((partner) => !needle || partnerSearchText(partner).includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, 'hr'));
  }, [all, query]);

  const addButton = (
    <Button nativeButton={false} render={<Link href={`${words.basePath}/new`} />}>
      <Icon data-icon="inline-start" icon="IconPlus" size="s" /> {words.add}
    </Button>
  );

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-heading text-3xl font-bold tracking-tight">{words.many}</h1>
      {addButton}
    </div>
  );

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="rounded-xl border">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon={words.icon} size="m" />
              </EmptyMedia>
              <EmptyTitle>{words.emptyTitle}</EmptyTitle>
              <EmptyDescription>Dodaj prvog: upiši porezni broj i podaci se popune iz VIES-a.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>{addButton}</EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  function open(partner: Partner, event: React.MouseEvent) {
    const href = partnerHref(kind, partner.id);
    if (event.metaKey || event.ctrlKey) window.open(href, '_blank', 'noopener');
    else void router.push(href);
  }

  const row = (partner: Partner) => (
    <TableRow className="cursor-pointer" key={partner.id} onClick={(event) => open(partner, event)}>
      <TableCell className="py-3">
        <div className="flex min-w-0 flex-col">
          {/* A real link too: middle-click / keyboard open the partner. */}
          <Link
            className="truncate text-[0.9375rem] font-medium outline-none focus-visible:underline"
            href={partnerHref(kind, partner.id)}
            onClick={(event) => event.stopPropagation()}
          >
            {partner.name}
          </Link>
          <PlaceLine partner={partner} />
        </div>
      </TableCell>
      <TableCell className="py-3 tabular-nums">
        <CopyValue value={partner.taxId} what="Porezni broj" />
      </TableCell>
      <TableCell className="py-3 text-right tabular-nums">
        {formatTerms(partner.termsOfPayment, { short: true }) ?? <Dash />}
      </TableCell>
      <TableCell className="max-w-56 py-3">
        <CopyValue
          suffix={
            partner.emails.length > 1 && (
              <span className="shrink-0 text-xs text-muted-foreground">+{partner.emails.length - 1}</span>
            )
          }
          value={partner.emails[0]}
          what="Email"
        />
      </TableCell>
      <TableCell className="w-12 py-3 text-right" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button aria-label={`Akcije za ${partner.name}`} size="icon-sm" variant="ghost" />}
          >
            <Icon icon="IconDots" size="s" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <PartnerMenuItems kind={kind} partner={partner} onDelete={setToDelete} />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = Array.from({ length: 8 }, (_, index) => (
      <TableRow className="hover:bg-transparent" key={index}>
        <TableCell className="py-3">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-28" />
          </div>
        </TableCell>
        <TableCell className="py-3">
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell className="py-3">
          <Skeleton className="ml-auto h-4 w-10" />
        </TableCell>
        <TableCell className="py-3">
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell />
      </TableRow>
    ));
  } else if (isError && all.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMNS}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="danger">
                <Icon icon="IconAlertTriangle" size="m" />
              </EmptyMedia>
              <EmptyTitle>Popis se nije učitao</EmptyTitle>
              <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={onRetry}>
              <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
            </Button>
          </Empty>
        </TableCell>
      </TableRow>
    );
  } else if (shown.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMNS}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="IconSearch" size="m" />
              </EmptyMedia>
              <EmptyTitle>Nema rezultata za „{query.trim()}”</EmptyTitle>
            </EmptyHeader>
            <Button variant="outline" onClick={() => setQuery('')}>
              Očisti pretragu
            </Button>
          </Empty>
        </TableCell>
      </TableRow>
    );
  } else {
    body = shown.map((partner) => (
      <ContextMenu key={partner.id}>
        <ContextMenuTrigger render={row(partner)} />
        <ContextMenuContent className="w-60">
          <PartnerMenuItems context kind={kind} partner={partner} onDelete={setToDelete} />
        </ContextMenuContent>
      </ContextMenu>
    ));
  }

  return (
    <div className="flex flex-col gap-4">
      {header}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <Icon icon="IconSearch" size="s" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={words.search}
            placeholder={words.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="Očisti" size="icon-xs" onClick={() => setQuery('')}>
                <Icon icon="IconX" size="xs" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        {!isLoading && all.length > 0 && (
          <span className="text-sm text-muted-foreground tabular-nums">
            {query.trim() ? `${shown.length} od ${all.length}` : pluralCount(all.length, words.count)}
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead>{words.one} · sjedište</TableHead>
              <TableHead>Porezni broj</TableHead>
              <TableHead className="text-right">Valuta plaćanja</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>
                <span className="sr-only">Akcije</span>
              </TableHead>
            </TableRow>
            <TableLoadingRow colSpan={COLUMNS} show={showFetching} />
          </TableHeader>
          <TableBody className={dimmed(showFetching)}>{body}</TableBody>
        </Table>
      </div>
      <PartnerDeleteDialog
        kind={kind}
        partner={toDelete}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </div>
  );
}

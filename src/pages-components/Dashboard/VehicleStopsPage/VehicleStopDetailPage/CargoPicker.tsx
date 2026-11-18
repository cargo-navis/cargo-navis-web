import * as React from 'react';

import { STOP_KIND, type StopKind } from '@/components/shared/stop-kind';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import type { AvailableCargo } from '@/lib/api';
import { useAvailableCargos, useClients } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { pluralCount } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import { formatAddressLabel } from './addressHelpers';
import { type FormCargo, toFormCargo } from './formValues';

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

interface Group {
  key: string;
  shipment: AvailableCargo['shipment'];
  cargos: AvailableCargo[];
}

/**
 * „Dodaj teret” inside the stop sheet (replaces today's CargoSelectDrawer, a second panel over the form): the tereti
 * not yet on a vehicle, grouped per nalog, searchable by nalog / klijent / adresa / opis; a click on the nalog picks all
 * of its tereti. Shown in place of the form, so there's never a panel on a panel.
 */
export function CargoPicker({
  kind,
  vehicleStopId,
  selected,
  onConfirm,
  onCancel,
}: {
  kind: StopKind;
  vehicleStopId?: string;
  selected: FormCargo[];
  onConfirm(cargos: FormCargo[]): void;
  onCancel(): void;
}) {
  const { data, isFetching } = useAvailableCargos(vehicleStopId, true);
  const { data: clients } = useClients();
  const [search, setSearch] = React.useState('');
  const [ids, setIds] = React.useState(() => new Set(selected.map((cargo) => cargo.id)));

  const clientName = React.useMemo(() => {
    const names = new Map<string, string>();
    clients?.forEach((client) => names.set(client.id.toString(), client.name));
    return (id?: string | null) => (id ? names.get(id) : undefined);
  }, [clients]);

  const groups = React.useMemo<Group[]>(() => {
    const cargos = (kind === 'loading' ? data?.loadingCargos : data?.unloadingCargos) ?? [];
    const map = new Map<string, Group>();
    cargos.forEach((cargo) => {
      const key = cargo.shipment?.id ?? 'none';
      const group = map.get(key) ?? { key, shipment: cargo.shipment, cargos: [] };
      group.cargos.push(cargo);
      map.set(key, group);
    });
    return Array.from(map.values());
  }, [data, kind]);

  const visible = React.useMemo(() => {
    const term = fold(search.trim());
    if (!term) return groups;
    return groups.filter((group) => {
      const text = [
        group.shipment?.orderNumber,
        clientName(group.shipment?.clientId),
        ...group.cargos.flatMap((cargo) => {
          const address = kind === 'loading' ? cargo.loadingAddress : cargo.unloadingAddress;
          return [address ? formatAddressLabel(address) : '', cargo.description];
        }),
      ]
        .filter(Boolean)
        .join(' ');
      return fold(text).includes(term);
    });
  }, [groups, search, clientName, kind]);

  const available = groups.flatMap((group) => group.cargos);
  const toggle = (id: string) =>
    setIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleGroup = (cargos: AvailableCargo[]) =>
    setIds((current) => {
      const next = new Set(current);
      const all = cargos.every((cargo) => next.has(cargo.id));
      cargos.forEach((cargo) => (all ? next.delete(cargo.id) : next.add(cargo.id)));
      return next;
    });

  function confirm() {
    const availableIds = new Set(available.map((cargo) => cargo.id));
    // Keep what was picked before but isn't offered here (e.g. filled from the address), unless unticked.
    const kept = selected.filter((cargo) => !availableIds.has(cargo.id) && ids.has(cargo.id));
    const picked = available
      .filter((cargo) => ids.has(cargo.id))
      .map((cargo) => toFormCargo(cargo, cargo.shipment ?? null));
    onConfirm([...kept, ...picked]);
  }

  const title = kind === 'loading' ? 'Tereti za utovar' : 'Tereti za istovar';

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Button aria-label="Natrag na obrazac" className="-ml-2" size="icon-sm" variant="ghost" onClick={onCancel}>
            <Icon icon="IconArrowLeft" size="s" />
          </Button>
          {title}
        </SheetTitle>
        <p className="text-sm text-muted-foreground">
          {ids.size > 0
            ? `Odabrano: ${pluralCount(ids.size, ['teret', 'tereta', 'tereta'])}`
            : 'Tereti koji još nisu na vozilu.'}
        </p>
      </SheetHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-5">
        {available.length > 0 && (
          <InputGroup>
            <InputGroupAddon>
              <Icon icon="IconSearch" size="s" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Pretraži terete"
              placeholder="Nalog, klijent, adresa ili opis…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label="Obriši pretragu" size="icon-xs" onClick={() => setSearch('')}>
                  <Icon icon="IconX" size="xs" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        )}
        {isFetching && !data ? (
          Array.from({ length: 5 }).map((_, index) => <Skeleton className="h-16 w-full rounded-lg" key={index} />)
        ) : available.length === 0 ? (
          <Empty className="min-h-60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="IconPackage" size="m" />
              </EmptyMedia>
              <EmptyTitle>Nema slobodnih tereta</EmptyTitle>
              <EmptyDescription>Svi tereti su već na nekom vozilu.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : visible.length === 0 ? (
          <Empty className="min-h-60">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="IconSearch" size="m" />
              </EmptyMedia>
              <EmptyTitle>Nema rezultata za „{search.trim()}”</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          visible.map((group) => {
            const all = group.cargos.every((cargo) => ids.has(cargo.id));
            return (
              <div className="flex flex-col gap-1.5" key={group.key}>
                {group.shipment && (
                  <button
                    className="flex w-fit items-center gap-1.5 text-left text-sm hover:text-primary dark:hover:text-teal-300"
                    type="button"
                    onClick={() => toggleGroup(group.cargos)}
                  >
                    <span className="font-medium tabular-nums">#{group.shipment.orderNumber}</span>
                    {clientName(group.shipment.clientId) && (
                      <span className="text-muted-foreground">· {clientName(group.shipment.clientId)}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{all ? '· makni sve' : '· odaberi sve'}</span>
                  </button>
                )}
                {group.cargos.map((cargo) => {
                  const address = kind === 'loading' ? cargo.loadingAddress : cargo.unloadingAddress;
                  const checked = ids.has(cargo.id);
                  return (
                    <label
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm',
                        checked && 'border-primary bg-primary/5 dark:bg-primary/15'
                      )}
                      key={cargo.id}
                    >
                      <Checkbox checked={checked} className="mt-0.5" onCheckedChange={() => toggle(cargo.id)} />
                      <span className="flex min-w-0 flex-col">
                        <span className="font-medium">{toFormCargo(cargo).label}</span>
                        {address && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className={cn('font-medium uppercase', STOP_KIND[kind].text)}>
                              {STOP_KIND[kind].label}
                            </span>
                            {formatAddressLabel(address)}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {cargo.weight.toLocaleString('hr-HR')} kg
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
      <SheetFooter>
        <Button variant="ghost" onClick={onCancel}>
          Odustani
        </Button>
        <Button onClick={confirm}>Potvrdi ({ids.size})</Button>
      </SheetFooter>
    </>
  );
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteEmployee, type DriverLicenceEnum, generateDriverPortalToken } from '@/lib/api';
import type { Employee } from '@/lib/api/employees.d';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils/initials';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { deadlineCounts, expiredWord, fullName, hasWhatsApp, isDriver, soonWord, sortLicences } from './employees';

/** Small neutral initials (lab /employees `Initials`: sm in the list, lg in the detail header). */
export function EmployeeInitials({ employee, size = 'sm' }: { employee: Employee; size?: 'sm' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground uppercase',
        size === 'sm' ? 'size-8 text-xs' : 'size-14 text-lg',
        employee.deleted && 'opacity-60'
      )}
    >
      {initials(fullName(employee))}
    </span>
  );
}

export function Adr({ size }: { size?: 'sm' | 'md' }) {
  return (
    <Badge look="outline" size={size} tone="warning">
      ADR
    </Badge>
  );
}

/** Kategorije, decided look „Highest, rest muted”: brand „CE” + muted „+ B, C” (+ amber ADR). */
export function LicenceCategories({
  licences,
  adr,
  size = 'md',
}: {
  licences?: DriverLicenceEnum[];
  adr?: boolean;
  size?: 'sm' | 'md';
}) {
  if (!licences || licences.length === 0) return <span className="text-muted-foreground">–</span>;
  const sorted = sortLicences(licences);
  const top = sorted[sorted.length - 1];
  const small = size === 'sm';
  return (
    <span className="flex items-center gap-1.5">
      <Badge className="font-mono" size={size} tone="brand">
        {top}
      </Badge>
      {sorted.length > 1 && (
        <span className={cn('font-mono text-muted-foreground', small ? 'text-[0.6875rem]' : 'text-xs')}>
          + {sorted.slice(0, -1).join(', ')}
        </span>
      )}
      {adr && <Adr size={size} />}
    </span>
  );
}

/**
 * „Aplikacija” column: nothing in the API says whether a driver uses the driver app yet, so only „WhatsApp spojen”
 * (today's messageChannel) shows (DECISIONS §5).
 */
export function AppState({ employee }: { employee: Employee }) {
  if (!isDriver(employee) || !hasWhatsApp(employee)) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge look="outline">
      <Icon className="text-success" icon="IconBrandWhatsapp" size="xs" /> WhatsApp spojen
    </Badge>
  );
}

/** „Isprave” column: „2 istekle · 1 uskoro”, „3 istječu uskoro” or „Sve valjane”. */
export function IspraveSummary({ employee }: { employee: Employee }) {
  if (employee.deleted) return <span className="text-muted-foreground">—</span>;
  const { expired, soon } = deadlineCounts(employee);
  if (expired > 0)
    return (
      <Badge tone="danger">
        {expired} {expiredWord(expired)}
        {soon > 0 && ` · ${soon} uskoro`}
      </Badge>
    );
  if (soon > 0)
    return (
      <Badge tone="warning">
        {soon} {soonWord(soon)} uskoro
      </Badge>
    );
  return (
    <Badge look="dot" tone="success">
      Sve valjane
    </Badge>
  );
}

/**
 * Deaktiviraj (lab /employees `DeactivateConfirm`): confirm, can't be undone (the API has no reactivation), logs the
 * person out. Today's call: deleteEmployee (soft delete → `deleted`).
 */
export function DeactivateDialog({
  employee,
  onOpenChange,
  onDone,
}: {
  employee: Employee | null;
  onOpenChange(open: boolean): void;
  onDone?(employee: Employee): void;
}) {
  const queryClient = useQueryClient();
  const [shown, setShown] = React.useState(employee);
  if (employee && employee !== shown) setShown(employee);
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'], type: 'all' }),
  });

  async function handleDeactivate() {
    if (!shown) return;
    try {
      await mutateAsync(shown.id);
      showSuccessToast({ title: 'Zaposlenik deaktiviran', description: fullName(shown) });
      onOpenChange(false);
      onDone?.(shown);
    } catch {
      showErrorToast({ title: 'Deaktiviranje nije uspjelo', description: 'Pokušaj ponovno.' });
    }
  }

  return (
    <AlertDialog open={!!employee} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon icon="IconUserOff" size="m" />
          </AlertDialogMedia>
          <AlertDialogTitle>Deaktivirati zaposlenika?</AlertDialogTitle>
          <AlertDialogDescription>
            {shown && fullName(shown)} se više neće moći prijaviti niti biti dodijeljen nalozima. Povijest naloga
            ostaje. Ovo se ne može poništiti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Odustani</AlertDialogCancel>
          <AlertDialogAction loading={isPending} variant="destructive" onClick={() => void handleDeactivate()}>
            <Icon data-icon="inline-start" icon="IconUserOff" size="s" /> Deaktiviraj
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Pozivnica za aplikaciju za vozače (lab /employees `InviteDialog`): opens while today's generateDriverPortalToken
 * runs, then shows the link to copy (`/driver/<token>`, valid 14 days).
 */
export function InviteDialog({
  employee,
  onOpenChange,
}: {
  /** Open while set; a new link is generated each time it opens. */
  employee: Employee | null;
  onOpenChange(open: boolean): void;
}) {
  const [shown, setShown] = React.useState(employee);
  const [url, setUrl] = React.useState('');
  const [copying, setCopying] = React.useState(false);
  const { mutateAsync } = useMutation({ mutationFn: (id: string) => generateDriverPortalToken(id) });
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  // Every opening starts without a link (even for the same person): the old one never shows while a new one generates.
  const open = !!employee;
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setUrl('');
  }
  if (employee && employee !== shown) setShown(employee);

  React.useEffect(() => {
    if (!employee) return;
    let cancelled = false;
    mutateAsync(employee.id).then(
      ({ token }) => {
        if (!cancelled) setUrl(`${window.location.origin}/driver/${token}`);
      },
      () => {
        if (cancelled) return;
        showErrorToast({ title: 'Greška s generiranjem pozivnice' });
        onOpenChangeRef.current(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [employee, mutateAsync]);

  async function handleCopy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(url);
      showSuccessToast({
        title: 'Pozivnica kopirana',
        description: 'Sada je pošalji vozaču putem SMS-a, WhatsAppa ili emaila.',
      });
      onOpenChange(false);
    } catch {
      showErrorToast({ title: 'Kopiranje nije uspjelo' });
    } finally {
      setCopying(false);
    }
  }

  return (
    <Dialog open={!!employee} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pozivnica za aplikaciju za vozače</DialogTitle>
          <DialogDescription>
            Pošalji link vozaču {shown && fullName(shown)} (WhatsApp, SMS). Kad ga otvori na mobitelu, prijavljen je u
            aplikaciju i vidi svoje naloge.
          </DialogDescription>
        </DialogHeader>
        {url ? (
          <InputGroup>
            <InputGroupInput
              aria-label="Link pozivnice"
              className="font-mono text-xs"
              readOnly
              value={url}
              onFocus={(event) => event.target.select()}
            />
          </InputGroup>
        ) : (
          <Skeleton className="h-10 w-full" />
        )}
        <Alert size="sm" variant="info">
          <AlertDescription>Pozivnica vrijedi 14 dana.</AlertDescription>
        </Alert>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Zatvori</DialogClose>
          <Button disabled={!url} loading={copying} onClick={() => void handleCopy()}>
            <Icon data-icon="inline-start" icon="IconCopy" size="s" /> Kopiraj link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

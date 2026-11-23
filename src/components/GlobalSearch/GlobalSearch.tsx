import { useDebouncedValue, useHotkeys, useOs } from '@mantine/hooks';
import { useRouter } from 'next/router';
import * as React from 'react';

import { NAV } from '@/components/layout/DashboardLayout/nav';
import { ENTITY_ICON } from '@/components/shared/entity-icons';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { track } from '@/lib/analytics';
import { VehicleEnum } from '@/lib/api';
import { GLOBAL_SEARCH_MIN_LENGTH, useDelayedFlag, useGlobalSearch } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { newVehicleHref } from '@/pages-components/Dashboard/FleetPage/fleet';
import { ACCEPTED_DRAFT_FILE_TYPES, useUploadDraftFiles } from '@/pages-components/Dashboard/ShipmentsPage/hooks';
import { Icon, type IconType } from '@/ui';

import { addRecentSearchItem, useRecentSearchItems } from './recent';
import { SearchResultAside } from './SearchResultAside';
import { SearchResultText } from './SearchResultText';
import { mapToSearchResultGroups, type SearchResultGroup, type SearchResultItem } from './utils';

/**
 * ⌘K (DECISIONS §3, lab /overlays/command): today's server search (300ms debounce, min 3 characters, groups +
 * „Prikaži svih N …”, highlighted match); before typing Nedavno + Akcije + Idi na; 768 wide; key hints; full screen on
 * phones. ⌘K / Ctrl K opens it from anywhere, also inside fields.
 */

const DEBOUNCE_MS = 300;

interface Action {
  key: string;
  label: string;
  icon: IconType;
  /** Extra words that find it („vozilo” finds the vehicle actions). */
  keywords?: string;
  /** Listed before you type (the others are found by typing). */
  start?: boolean;
  href?: string;
  upload?: boolean;
}

const ACTIONS: Action[] = [
  { key: 'new-shipment', label: 'Dodaj nalog', icon: 'IconPlus', href: '/dashboard/shipments/new', start: true },
  { key: 'upload', label: 'Učitaj nalog iz PDF-a', icon: 'IconFileUpload', upload: true, start: true },
  { key: 'new-employee', label: 'Dodaj zaposlenika', icon: 'IconUsers', href: '/dashboard/employees/new', start: true },
  {
    key: 'new-truck',
    label: 'Dodaj tegljač',
    icon: 'IconTruck',
    href: newVehicleHref(VehicleEnum.TRUCK),
    keywords: 'vozilo',
  },
  {
    key: 'new-trailer',
    label: 'Dodaj poluprikolicu',
    icon: 'IconTruck',
    href: newVehicleHref(VehicleEnum.TRAILER),
    keywords: 'vozilo',
  },
  {
    key: 'new-solo',
    label: 'Dodaj solo kamion',
    icon: 'IconTruck',
    href: newVehicleHref(VehicleEnum.SOLO_TRUCK),
    keywords: 'vozilo',
  },
  {
    key: 'new-van',
    label: 'Dodaj kombi',
    icon: 'IconTruck',
    href: newVehicleHref(VehicleEnum.VAN),
    keywords: 'vozilo',
  },
  { key: 'new-client', label: 'Dodaj klijenta', icon: ENTITY_ICON.client, href: '/dashboard/clients/new' },
  {
    key: 'new-contractor',
    label: 'Dodaj podvozara',
    icon: ENTITY_ICON.contractor,
    href: '/dashboard/contractors/new',
    // The old name still finds it (renamed from Kontraktori 2026-11-21).
    keywords: 'kontraktor prijevoznik',
  },
];

// Case- and diacritic-insensitive, like the server search („cetvrt” finds „Četvrt”).
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

export const GlobalSearch = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // „Učitaj nalog iz PDF-a”: the Nalozi page's upload and messages, then the Nalozi u pripremi tab.
  const uploadDrafts = useUploadDraftFiles(() => void router.push('/dashboard/shipments?tab=drafts'), 'search');

  // Empty tagsToIgnore so the shortcut also works while focus is inside a form input
  useHotkeys([['mod+K', () => setIsOpen((open) => !open)]], []);

  return (
    <>
      <SearchTrigger onClick={() => setIsOpen(true)} />
      <input
        accept={ACCEPTED_DRAFT_FILE_TYPES.join(',')}
        className="hidden"
        multiple
        ref={fileInputRef}
        type="file"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length > 0) void uploadDrafts(files);
        }}
      />
      <CommandDialog
        className={cn(
          'sm:max-w-3xl',
          // Phone: full screen, the keyboard takes half of it.
          'max-sm:inset-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:rounded-none! max-sm:ring-0'
        )}
        description="Naloge, flotu, zaposlenike, klijente i podvozare"
        open={isOpen}
        title="Pretraživanje"
        onOpenChange={setIsOpen}
      >
        <Palette
          onClose={() => setIsOpen(false)}
          onUpload={() => {
            setIsOpen(false);
            fileInputRef.current?.click();
          }}
        />
      </CommandDialog>
    </>
  );
};

const SearchTrigger = ({ onClick }: { onClick(): void }) => {
  const os = useOs();
  const shortcut = os === 'macos' || os === 'ios' ? '⌘K' : 'Ctrl K';

  return (
    <button
      className="flex h-10 w-full max-w-[420px] items-center gap-2 rounded-xl border bg-background px-3 text-sm text-muted-foreground hover:bg-muted/50"
      type="button"
      onClick={onClick}
    >
      <Icon icon="IconSearch" size="s" />
      <span className="flex-1 text-left">Pretraži…</span>
      <Kbd className="max-sm:hidden">{shortcut}</Kbd>
    </button>
  );
};

function Palette({ onClose, onUpload }: { onClose(): void; onUpload(): void }) {
  const router = useRouter();
  const recent = useRecentSearchItems();

  const [query, setQuery] = React.useState('');
  const trimmed = query.trim();
  const typed = trimmed.length;
  const [debouncedQuery] = useDebouncedValue(trimmed, DEBOUNCE_MS);

  const { data, isFetching, isError, isPlaceholderData, refetch } = useGlobalSearch(debouncedQuery);
  // The query the shown results belong to (placeholder data is the previous query's), for highlights and links.
  const shownQueryRef = React.useRef('');
  if (data && !isPlaceholderData) shownQueryRef.current = debouncedQuery;
  const shownQuery = shownQueryRef.current;

  const groups = React.useMemo(() => (data ? mapToSearchResultGroups(data, shownQuery) : null), [data, shownQuery]);

  // Loading counts from the request, not from typing: the 300ms debounce isn't „waiting for the server”.
  const loading = typed >= GLOBAL_SEARCH_MIN_LENGTH && isFetching;
  const showLoading = useDelayedFlag(loading);

  const isStart = typed === 0;
  const tooShort = typed > 0 && typed < GLOBAL_SEARCH_MIN_LENGTH;
  const matches = (...texts: (string | undefined)[]) =>
    isStart || normalize(texts.join(' ')).includes(normalize(trimmed));
  const actions = ACTIONS.filter((action) => (isStart ? action.start : matches(action.label, action.keywords)));
  const goTo = NAV.filter((item) => matches(item.label));
  const localHits = !isStart && (actions.length > 0 || goTo.length > 0);

  function go(href: string) {
    onClose();
    void router.push(href);
  }

  /** Analytics: what kind of entry was picked, and how long the query was (never the query itself). */
  const picked = (resultType: string) =>
    track('search used', { result_type: resultType, query_length: trimmed.length });

  function openResult(group: SearchResultGroup, item: SearchResultItem) {
    addRecentSearchItem({
      category: group.key,
      id: item.id,
      href: item.href,
      title: item.title,
      subtitle: item.subtitle,
    });
    go(item.href);
  }

  // What the server part of the list shows (decision „While the server searches”: old results dimmed, skeleton first).
  let server: React.ReactNode = null;
  if (typed >= GLOBAL_SEARCH_MIN_LENGTH) {
    const haveOld = !!groups && groups.length > 0;
    if (isError && !isFetching) {
      server = (
        <Message tone="error">
          Pretraživanje nije uspjelo.{' '}
          <button className="font-medium underline underline-offset-2" type="button" onClick={() => void refetch()}>
            Pokušaj ponovno.
          </button>
        </Message>
      );
    } else if (showLoading && !haveOld) {
      server = <SkeletonResults />;
    } else if (groups && groups.length > 0) {
      server = (
        <div className={cn('transition-opacity', showLoading && 'opacity-50')}>
          {groups.map((group) => (
            <CommandGroup heading={group.heading} key={group.key}>
              {group.items.map((item) => (
                <CommandItem
                  className="items-start"
                  key={item.id}
                  value={`${group.key}-${item.id}`}
                  onSelect={() => {
                    picked(group.key);
                    openResult(group, item);
                  }}
                >
                  {/* 20px first line, 16px icon: 2px down. */}
                  <Icon className="mt-0.5" icon={group.icon} size="s" />
                  <SearchResultText item={item} query={shownQuery} />
                  {item.aside && (
                    <SearchResultAside aside={item.aside} className="w-56 text-xs max-sm:hidden" query={shownQuery} />
                  )}
                </CommandItem>
              ))}
              {group.showAll && (
                <CommandItem
                  className="text-brand"
                  value={`${group.key}-show-all`}
                  onSelect={() => {
                    picked(`${group.key}_all`);
                    go(group.showAll!.href);
                  }}
                >
                  <Icon className="[&_svg]:text-current!" icon="IconArrowRight" size="s" /> {group.showAll.label}
                </CommandItem>
              )}
            </CommandGroup>
          ))}
        </div>
      );
    } else if (!loading && groups && !localHits) {
      server = <Message>Nema rezultata za „{shownQuery || trimmed}”.</Message>;
    }
  }

  return (
    <Command
      className="rounded-none bg-transparent max-sm:h-full"
      label="Globalno pretraživanje"
      loop
      shouldFilter={false}
    >
      <div className="flex items-center gap-1">
        <div className="relative min-w-0 flex-1">
          <CommandInput
            autoFocus
            placeholder="Pretraži naloge, flotu, zaposlenike, klijente i podvozare…"
            value={query}
            onValueChange={setQuery}
          />
          {showLoading && (
            <Spinner
              aria-label="Pretražujem"
              className="absolute top-1/2 right-4 mt-0.5 -translate-y-1/2 text-muted-foreground"
            />
          )}
        </div>
        <Button className="mt-1 mr-1 sm:hidden" size="sm" variant="ghost" onClick={onClose}>
          Odustani
        </Button>
      </div>
      <CommandList className="max-h-[min(60vh,28rem)] max-sm:max-h-none max-sm:flex-1">
        {tooShort && <Message>Upiši najmanje {GLOBAL_SEARCH_MIN_LENGTH} znaka.</Message>}

        {isStart && recent.length > 0 && (
          <CommandGroup heading="Nedavno">
            {recent.map((item) => (
              <CommandItem
                key={item.href}
                value={`recent-${item.href}`}
                onSelect={() => {
                  picked('recent');
                  go(item.href);
                }}
              >
                <Icon className="text-muted-foreground" icon="IconClock" size="s" />
                <span className="truncate">{item.title}</span>
                {item.subtitle && <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {server}

        {actions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Akcije">
              {actions.map((action) => (
                <CommandItem
                  key={action.key}
                  value={`action-${action.key}`}
                  onSelect={() => {
                    picked(`action_${action.key}`);
                    if (action.upload) onUpload();
                    else go(action.href!);
                  }}
                >
                  <Icon icon={action.icon} size="s" /> {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {goTo.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Idi na">
              {goTo.map((item) => (
                <CommandItem
                  key={item.key}
                  value={`go-${item.key}`}
                  onSelect={() => {
                    picked('go_to');
                    go(item.href);
                  }}
                >
                  <Icon icon={item.icon} size="s" /> {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
      <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground max-sm:hidden">
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> odaberi
        </span>
        <span className="flex items-center gap-1">
          <Kbd>↵</Kbd> otvori
        </span>
        <span className="flex items-center gap-1">
          <Kbd>esc</Kbd> zatvori
        </span>
      </div>
    </Command>
  );
}

function Message({ children, tone }: { children: React.ReactNode; tone?: 'error' }) {
  return (
    <p className={cn('py-6 text-center text-sm', tone === 'error' ? 'text-destructive' : 'text-muted-foreground')}>
      {children}
    </p>
  );
}

function SkeletonResults() {
  return (
    <div className="flex flex-col gap-1 p-1">
      <Skeleton className="mx-2 my-1.5 h-3 w-16" />
      {[0, 1, 2].map((index) => (
        <div className="flex items-center gap-2 px-2 py-2" key={index}>
          <Skeleton className="size-4 rounded" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-3 w-32 max-sm:hidden" />
        </div>
      ))}
    </div>
  );
}

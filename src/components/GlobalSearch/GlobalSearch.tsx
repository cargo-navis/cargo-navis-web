import { useDebouncedValue, useHotkeys, useOs } from '@mantine/hooks';
import { Command } from 'cmdk';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';

import { GLOBAL_SEARCH_MIN_LENGTH, useGlobalSearch } from '@/lib/hooks';
import { Box, Dialog, DialogContent, DialogTitle, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';

import { SearchResultText } from './SearchResultText';
import { mapToSearchResultGroups } from './utils';

const DEBOUNCE_MS = 300;

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Empty tagsToIgnore so the shortcut also works while focus is inside a form input
  useHotkeys([['mod+K', () => setIsOpen((open) => !open)]], []);

  return (
    <>
      <SearchTrigger onClick={() => setIsOpen(true)} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl mt-[10vh] p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Pretraživanje</DialogTitle>
          <SearchCommand onNavigate={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const SearchTrigger = ({ onClick }: { onClick(): void }) => {
  const os = useOs();
  const shortcut = os === 'macos' || os === 'ios' ? '⌘K' : 'Ctrl K';

  return (
    <Box
      as="button"
      className="flex items-center gap-2 w-full max-w-[420px] h-[40px] px-3 rounded-s border-[2px] border-dark-300 dark:border-light-800 hover:border-dark-500 hover:dark:border-light-700 text-dark-400 dark:text-light-800"
      type="button"
      onClick={onClick}
    >
      <Icon icon="IconSearch" />
      <Text className="grow text-left">Pretraži...</Text>
      <Text as="kbd" className="px-1 rounded-xs border border-dark-100 dark:border-light-800" variant="text-xxs">
        {shortcut}
      </Text>
    </Box>
  );
};

const SearchCommand = ({ onNavigate }: { onNavigate(): void }) => {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const [debouncedQuery] = useDebouncedValue(trimmedQuery, DEBOUNCE_MS);

  const { data, isFetching, isError } = useGlobalSearch(debouncedQuery);

  const groups = useMemo(() => (data ? mapToSearchResultGroups(data, debouncedQuery) : []), [data, debouncedQuery]);

  const isQueryTooShort = trimmedQuery.length < GLOBAL_SEARCH_MIN_LENGTH;
  const isSearching = !isQueryTooShort && (trimmedQuery !== debouncedQuery || isFetching);

  function handleSelect(href: string) {
    onNavigate();
    router.push(href);
  }

  function renderResults() {
    if (isQueryTooShort) return <StatusMessage text={`Upišite najmanje ${GLOBAL_SEARCH_MIN_LENGTH} znaka.`} />;
    if (isError) return <StatusMessage text="Pretraživanje nije uspjelo. Pokušajte ponovno." />;
    if (groups.length === 0) return <StatusMessage text={isSearching ? 'Pretraživanje...' : 'Nema rezultata.'} />;

    return groups.map((group) => (
      <Command.Group
        className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-dark-500 dark:[&_[cmdk-group-heading]]:text-light-300"
        heading={group.heading}
        key={group.key}
      >
        {group.items.map((item) => (
          <Command.Item
            className="flex items-center gap-3 px-3 py-2 rounded-s cursor-pointer data-[selected=true]:bg-dark-50 dark:data-[selected=true]:bg-light-800"
            key={item.id}
            value={`${group.key}-${item.id}`}
            onSelect={() => handleSelect(item.href)}
          >
            <Icon color="text-dark-600 dark:text-light-300" icon={group.icon} size="l" />
            <SearchResultText item={item} query={debouncedQuery} />
          </Command.Item>
        ))}
        {group.showAll && (
          <ShowAllItem
            href={group.showAll.href}
            label={group.showAll.label}
            value={`${group.key}-show-all`}
            onSelect={handleSelect}
          />
        )}
      </Command.Group>
    ));
  }

  return (
    <Command label="Globalno pretraživanje" loop shouldFilter={false}>
      <FlexLayout className="items-center gap-2 px-4 border-b border-dark-100 dark:border-light-800">
        <Icon color="text-dark-600 dark:text-light-300" icon="IconSearch" />
        <Command.Input
          autoFocus
          className="grow py-4 bg-transparent outline-none font-display md:text-s text-dark-800 dark:text-light-50 placeholder:text-dark-400 dark:placeholder:text-light-800"
          placeholder="Pretraži naloge, flotu, zaposlenike, klijente i kontraktore..."
          value={query}
          onValueChange={setQuery}
        />
        {isSearching && <LoadingSpinner size="s" />}
      </FlexLayout>
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">{renderResults()}</Command.List>
    </Command>
  );
};

interface ShowAllItemProps {
  href: string;
  label: string;
  value: string;
  onSelect(href: string): void;
}

const ShowAllItem = ({ href, label, value, onSelect }: ShowAllItemProps) => (
  <Command.Item
    className="flex items-center gap-3 px-3 py-2 rounded-s cursor-pointer text-teal-600 dark:text-teal-500 data-[selected=true]:bg-dark-50 dark:data-[selected=true]:bg-light-800"
    value={value}
    onSelect={() => onSelect(href)}
  >
    <FlexLayout className="justify-center w-[24px]">
      <Icon icon="IconArrowRight" size="s" />
    </FlexLayout>
    <Text variant="text-xs-medium">{label}</Text>
  </Command.Item>
);

const StatusMessage = ({ text }: { text: string }) => (
  <Text as="p" className="px-3 py-6 text-center" color="text-color-3">
    {text}
  </Text>
);

import { useEffect, useMemo, useState } from 'react';

import { ClientName } from '@/components/clients/ClientName';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer';
import type { Cargo } from '@/lib/api';
import { useShipmentsData } from '@/lib/hooks';
import { Box, Button, FlexLayout, Icon, Skeleton, Text } from '@/ui';

export type CargoWithClient = Cargo & { clientId?: string };

interface CargoSelectDrawerProps {
  isOpen: boolean;
  title: string;
  addressType: 'loading' | 'unloading';
  selected: Cargo[];
  onOpenChange(isOpen: boolean): void;
  onConfirm(cargos: Cargo[]): void;
}

export const CargoSelectDrawer = ({
  isOpen,
  title,
  addressType,
  selected,
  onOpenChange,
  onConfirm,
}: CargoSelectDrawerProps) => {
  const { data: shipments, isLoading } = useShipmentsData({ params: { active: true }, enabled: isOpen });

  const cargos = useMemo<CargoWithClient[]>(
    () => shipments?.flatMap((s) => s.cargo.map((c) => ({ ...c, clientId: s.clientId }))) ?? [],
    [shipments]
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(selected.map((c) => c.id)));

  useEffect(() => {
    if (isOpen) setSelectedIds(new Set(selected.map((c) => c.id)));
  }, [isOpen, selected]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(cargos.filter((c) => selectedIds.has(c.id)));
    onOpenChange(false);
  }

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <Text color="text-color-1" variant="text-m-medium">
            {title}
          </Text>
          <Text color="text-color-4" variant="text-xs">
            Odaberi terete
          </Text>
        </DrawerHeader>
        <Box className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <FlexLayout className="flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton borderRadius="m" height={64} key={i} width="100%" />
              ))}
            </FlexLayout>
          ) : cargos.length === 0 ? (
            <Text color="text-color-3" variant="text-s">
              Nema tereta u aktivnim pošiljkama.
            </Text>
          ) : (
            <FlexLayout className="flex-col gap-2">
              {cargos.map((cargo) => {
                const isSelected = selectedIds.has(cargo.id);
                const address = addressType === 'loading' ? cargo.loadingAddress : cargo.unloadingAddress;
                const addressLine = address
                  ? [address.streetName, [address.postalCode, address.placeName].filter(Boolean).join(' ')]
                      .filter(Boolean)
                      .join(', ')
                  : null;
                return (
                  <FlexLayout
                    as="button"
                    className={`items-center justify-between gap-3 rounded-m border p-3 text-left ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-dark-100 hover:border-teal-500/70 dark:border-light-800'
                    }`}
                    key={cargo.id}
                    type="button"
                    onClick={() => toggle(cargo.id)}
                  >
                    <FlexLayout className="flex-col">
                      <ClientName color="text-color-3" id={cargo.clientId} variant="text-xxs" />
                      <Text color="text-color-1" variant="text-s-medium">
                        {cargo.description || '-'}
                      </Text>
                      {addressLine && (
                        <Text color="text-color-3" variant="text-xxs">
                          {addressLine}
                        </Text>
                      )}
                      <Text color="text-color-4" variant="text-xxs">
                        {cargo.weight} kg
                      </Text>
                    </FlexLayout>
                    {isSelected && <Icon className="text-teal-500" icon="CheckIcon" size="m" />}
                  </FlexLayout>
                );
              })}
            </FlexLayout>
          )}
        </Box>
        <DrawerFooter>
          <Button isFullWidth text={`Potvrdi (${selectedIds.size})`} onClick={handleConfirm} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

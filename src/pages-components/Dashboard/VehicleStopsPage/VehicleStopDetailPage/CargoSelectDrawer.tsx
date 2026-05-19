import { useEffect, useMemo, useState } from 'react';

import { ClientName } from '@/components/clients/ClientName';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '@/components/ui/drawer';
import type { Cargo, Shipment } from '@/lib/api';
import { useShipmentsData } from '@/lib/hooks';
import { getCargoLabelParts } from '@/lib/utils/cargo';
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

interface CargoGroup {
  shipment: Shipment;
  cargos: CargoWithClient[];
}

function addressKey(address: { postalCodeId: string; streetName: string | null } | null | undefined): string | null {
  if (!address) return null;
  return `${address.postalCodeId}|${address.streetName ?? ''}`;
}

function buildAvailableGroups(shipments: Shipment[]): CargoGroup[] {
  return shipments.map((shipment) => buildGroup(shipment)).filter((g) => g.cargos.length > 0);
}

function buildGroup(shipment: Shipment): CargoGroup {
  const scheduledAddressKeys = new Set(
    (shipment.vehicleStops ?? []).map((stop) => addressKey(stop.address)).filter((key): key is string => key !== null)
  );

  const cargos = shipment.cargo
    .filter((cargo) => !scheduledAddressKeys.has(addressKey(cargo.unloadingAddress)!))
    .map((cargo) => ({ ...cargo, clientId: shipment.clientId }));

  return { shipment, cargos };
}

export const CargoSelectDrawer = ({
  isOpen,
  title,
  addressType,
  selected,
  onOpenChange,
  onConfirm,
}: CargoSelectDrawerProps) => {
  const { data: shipments, isLoading } = useShipmentsData({ params: { isActive: true }, enabled: isOpen });

  const groups = useMemo<CargoGroup[]>(() => (shipments ? buildAvailableGroups(shipments) : []), [shipments]);

  const allCargos = useMemo<CargoWithClient[]>(() => groups.flatMap((g) => g.cargos), [groups]);

  const initialIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialIds));

  useEffect(() => {
    if (isOpen) setSelectedIds(new Set(initialIds));
  }, [isOpen, initialIds]);

  const hasChanges = useMemo(() => {
    if (selectedIds.size !== initialIds.size) return true;
    return Array.from(selectedIds).some((id) => !initialIds.has(id));
  }, [selectedIds, initialIds]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleShipment(cargos: CargoWithClient[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = cargos.every((c) => next.has(c.id));
      cargos.forEach((c) => (allSelected ? next.delete(c.id) : next.add(c.id)));
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(allCargos.filter((c) => selectedIds.has(c.id)));
    onOpenChange(false);
  }

  const selectedShipmentCount = groups.filter((g) => g.cargos.some((c) => selectedIds.has(c.id))).length;

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <Text color="text-color-1" variant="text-m-medium">
            {title}
          </Text>
          <Text color="text-color-4" variant="text-xs">
            {selectedIds.size > 0 ? `Nalozi: ${selectedShipmentCount} · Tereti: ${selectedIds.size}` : 'Odaberi terete'}
          </Text>
        </DrawerHeader>
        <Box className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <FlexLayout className="flex-col gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton borderRadius="m" height={64} key={i} width="100%" />
              ))}
            </FlexLayout>
          ) : allCargos.length === 0 ? (
            <FlexLayout className="flex-col items-center justify-center h-full">
              <Text className="text-center" color="text-color-3" variant="text-s">
                Svi tereti su već dodijeljeni nekom prijevozu.
              </Text>
            </FlexLayout>
          ) : (
            <FlexLayout className="flex-col">
              {groups.map(({ shipment, cargos }) => {
                const isAllSelected = cargos.length > 0 && cargos.every((c) => selectedIds.has(c.id));
                return (
                  <FlexLayout
                    className={`flex-col gap-2 -mx-4 border-t px-4 py-3 ${
                      isAllSelected ? 'border-teal-500 bg-teal-500/10' : 'border-dark-100 dark:border-light-800'
                    }`}
                    key={shipment.id}
                  >
                    <FlexLayout
                      as="button"
                      className="group/shipment items-center gap-1 text-left"
                      type="button"
                      onClick={() => toggleShipment(cargos)}
                    >
                      <Icon
                        className="group-hover/shipment:text-teal-500"
                        color={isAllSelected ? 'text-teal-500' : 'text-color-3'}
                        icon="IconFileDescription"
                        size="s"
                      />
                      <Text
                        className="group-hover/shipment:text-teal-500"
                        color={isAllSelected ? 'text-teal-500' : 'text-color-2'}
                        variant="text-xs-medium"
                      >
                        Nalog {shipment.orderNumber}
                      </Text>
                      {shipment.clientId && (
                        <>
                          <Text className="group-hover/shipment:text-teal-500" color="text-color-4" variant="text-xxs">
                            ·
                          </Text>
                          <ClientName
                            className="group-hover/shipment:text-teal-500"
                            color={isAllSelected ? 'text-teal-500' : 'text-color-3'}
                            id={shipment.clientId}
                            variant="text-xxs"
                          />
                        </>
                      )}
                    </FlexLayout>
                    <FlexLayout className="flex-col gap-2">
                      {cargos.map((cargo) => (
                        <CargoRow
                          addressType={addressType}
                          cargo={cargo}
                          isSelected={selectedIds.has(cargo.id)}
                          key={cargo.id}
                          onToggle={() => toggle(cargo.id)}
                        />
                      ))}
                    </FlexLayout>
                  </FlexLayout>
                );
              })}
            </FlexLayout>
          )}
        </Box>
        <DrawerFooter>
          <Button isDisabled={!hasChanges} isFullWidth text={`Potvrdi (${selectedIds.size})`} onClick={handleConfirm} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

interface CargoRowProps {
  cargo: CargoWithClient;
  addressType: 'loading' | 'unloading';
  isSelected: boolean;
  onToggle(): void;
}

const CargoRow = ({ cargo, addressType, isSelected, onToggle }: CargoRowProps) => {
  const address = addressType === 'loading' ? cargo.loadingAddress : cargo.unloadingAddress;
  const addressLine = address
    ? [address.streetName, [address.postalCode, address.placeName].filter(Boolean).join(' ')].filter(Boolean).join(', ')
    : null;
  const { primary, secondary } = getCargoLabelParts(cargo);

  return (
    <FlexLayout
      as="button"
      className={`items-center justify-between gap-3 relative rounded-m border p-3 text-left ${
        isSelected
          ? 'border-teal-500 bg-[#eaf4f5] dark:bg-[#1c2627]'
          : 'border-dark-100 hover:border-teal-500/70 dark:border-light-800'
      }`}
      type="button"
      onClick={onToggle}
    >
      <FlexLayout className="flex-col">
        <Text color="text-color-1" variant="text-s-medium">
          {primary}
        </Text>
        {secondary && (
          <Text color="text-color-3" variant="text-xxs">
            {secondary}
          </Text>
        )}
        {addressLine && (
          <Text color="text-color-3" variant="text-xxs">
            {addressLine}
          </Text>
        )}
        <Text color="text-color-4" variant="text-xxs">
          {cargo.weight} kg
        </Text>
      </FlexLayout>
      {isSelected && (
        <Box className="absolute right-0 top-0 bottom-0 rounded-m flex items-center pr-3 pl-4 bg-gradient-to-l from-[#eaf4f5] dark:from-[#1c2627] from-65% to-transparent pointer-events-none">
          <Icon className="text-teal-500" icon="IconCheck" size="m" />
        </Box>
      )}
    </FlexLayout>
  );
};

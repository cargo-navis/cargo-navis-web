import Link from 'next/link';

import { ClientName } from '@/components/clients/ClientName';
import type { VehicleStopCargo, VehicleStopCargoShipment } from '@/lib/api/vehicleStops';
import { FlexLayout, Icon, Text } from '@/ui';
import type { IconType } from '@/ui/components/Icon/Icon';

interface CargoSectionProps {
  cargos: VehicleStopCargo[];
  addressType: 'loading' | 'unloading';
  icon: IconType;
  label: string;
  className?: string;
}

export const CargoSection = ({ cargos, addressType, icon, label, className }: CargoSectionProps) => {
  const groups = groupByShipment(cargos);
  const borderClass = addressType === 'loading' ? 'border-orange-500' : 'border-teal-500';
  const textClass =
    addressType === 'loading' ? 'text-orange-500 dark:text-orange-300' : 'text-teal-500 dark:text-teal-300';
  const bgClass =
    addressType === 'loading'
      ? 'bg-[#ECE4D9] dark:bg-[#321D0C] hover:bg-orange-100 dark:hover:bg-orange-800'
      : 'bg-[#DFEDEE] dark:bg-[#092A26] hover:bg-teal-100 dark:hover:bg-teal-800';

  return (
    <FlexLayout className="flex-1 flex-col gap-3">
      <FlexLayout className={`items-center gap-1 ${className ?? ''}`}>
        <Icon icon={icon} size="m" />
        <Text variant="text-xs">
          {label} ({cargos.length})
        </Text>
      </FlexLayout>
      <FlexLayout as="ul" className="flex-col gap-5">
        {groups.map((group) => (
          <FlexLayout
            as="li"
            className={`relative flex-col gap-2 rounded-m border-2 ${borderClass} px-2 pt-3 pb-2`}
            key={group.shipment.id}
          >
            <ShipmentHeader
              bgClass={bgClass}
              borderClass={borderClass}
              className="absolute -top-[14px] left-2"
              shipment={group.shipment}
              textClass={textClass}
            />
            <FlexLayout className="flex-col gap-2">
              {group.cargos.map((cargo) => (
                <CargoCard addressType={addressType} cargo={cargo} key={cargo.id} />
              ))}
            </FlexLayout>
          </FlexLayout>
        ))}
      </FlexLayout>
    </FlexLayout>
  );
};

interface CargoGroup {
  shipment: VehicleStopCargoShipment;
  cargos: VehicleStopCargo[];
}

function groupByShipment(cargos: VehicleStopCargo[]): CargoGroup[] {
  const map = new Map<string, CargoGroup>();
  cargos.forEach((cargo) => {
    const existing = map.get(cargo.shipment.id);
    if (existing) existing.cargos.push(cargo);
    else map.set(cargo.shipment.id, { shipment: cargo.shipment, cargos: [cargo] });
  });
  return Array.from(map.values());
}

interface ShipmentHeaderProps {
  shipment: VehicleStopCargoShipment;
  borderClass: string;
  textClass: string;
  bgClass: string;
  className?: string;
}

const ShipmentHeader = ({ shipment, borderClass, textClass, bgClass, className }: ShipmentHeaderProps) => (
  <Link
    className={`flex items-center gap-1 rounded-xxl border ${borderClass} ${bgClass} px-2 py-0.5 transition-colors ${className ?? ''}`}
    href={`/dashboard/shipments/${shipment.id}`}
  >
    <Icon color={textClass} icon="DocumentTextIcon" size="s" />
    <Text color={textClass} variant="text-xxs-medium">
      Nalog {shipment.orderNumber}
    </Text>
    {shipment.clientId && (
      <>
        <Text color={textClass} variant="text-xxs">
          ·
        </Text>
        <ClientName color={textClass} id={shipment.clientId} variant="text-xxs" />
      </>
    )}
  </Link>
);

interface CargoCardProps {
  cargo: VehicleStopCargo;
  addressType: 'loading' | 'unloading';
}

const CargoCard = ({ cargo, addressType }: CargoCardProps) => {
  const companyName = addressType === 'loading' ? cargo.loadingCompanyName : cargo.unloadingCompanyName;
  const companyLabel = addressType === 'loading' ? 'Tvrtka utovara' : 'Tvrtka istovara';

  return (
    <FlexLayout className="flex-col p-2">
      <FlexLayout className="items-center justify-between gap-2">
        <Text color="text-color-1" variant="text-xs-medium">
          {cargo.description || '-'}
        </Text>
      </FlexLayout>
      <Text color="text-color-3" variant="text-xxs">
        {cargo.weight} kg
      </Text>
      {companyName && (
        <FlexLayout className="items-center gap-1">
          <Text color="text-color-4" variant="text-xxs-medium">
            {companyLabel}:
          </Text>
          <Text color="text-color-4" variant="text-xxs">
            {companyName}
          </Text>
        </FlexLayout>
      )}
    </FlexLayout>
  );
};

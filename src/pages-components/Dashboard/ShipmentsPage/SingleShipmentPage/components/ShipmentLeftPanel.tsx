import { useState } from 'react';

import { EmployeeName } from '@/components/employees/EmployeeName';
import { Shipment } from '@/lib/api';
import { getDataPointDateString } from '@/lib/utils/date';
import { Box, Divider, FlexLayout, Icon, Text, TextButton, Tooltip } from '@/ui';

import { EmptyShipmentVehicleStops } from './EmptyShipmentVehicleStops';
import { ShipmentNoteModal } from './ShipmentNoteModal';
import { ShipmentVehicleStops } from './ShipmentVehicleStops';

interface ShipmentLeftPanelProps {
  shipment: Shipment;
  onAssignClick(): void;
}

const cardClass = 'rounded-m border border-dark-200 dark:border-light-800 p-4';

export const ShipmentLeftPanel = ({ shipment, onAssignClick }: ShipmentLeftPanelProps) => {
  const isAgency = (shipment.children?.length ?? 0) > 0;
  const isAssigned = (shipment.vehicleStops?.length ?? 0) > 0;

  const child = shipment.children?.[0];
  const transportPrice = child?.price;
  const ruc = transportPrice !== undefined ? shipment.price - transportPrice : undefined;
  const rucClass =
    ruc !== undefined && ruc < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';

  const [editingNoteType, setEditingNoteType] = useState<'internal' | 'external' | null>(null);

  return (
    <FlexLayout as="section" className="flex-col gap-4">
      <Box className={cardClass}>
        <FlexLayout className="flex-col gap-3">
          <Text color="text-color-2" variant="text-m-medium">
            Reference
          </Text>
          <FlexLayout className="items-center justify-between">
            <Text color="text-color-3" variant="text-xs-medium">
              Vanjska referenca
            </Text>
            <Text color="text-color-1" variant="text-s-medium">
              {shipment.externalOrderReference || '—'}
            </Text>
          </FlexLayout>
          <FlexLayout className="items-center justify-between">
            <Text color="text-color-3" variant="text-xs-medium">
              Kreirano
            </Text>
            <Text color="text-color-1" variant="text-s-medium">
              {getDataPointDateString(shipment.createdAt)}
            </Text>
          </FlexLayout>
          {shipment.createdById && (
            <FlexLayout className="items-center justify-between">
              <Text color="text-color-3" variant="text-xs-medium">
                Kreirao
              </Text>
              <EmployeeName color="text-color-1" id={shipment.createdById} variant="text-s-medium" />
            </FlexLayout>
          )}
        </FlexLayout>
      </Box>

      <Box className={cardClass}>
        <FlexLayout className="flex-col gap-1">
          <Text color="text-color-2" variant="text-m-medium">
            Financije
          </Text>
          <FlexLayout className="items-center justify-between">
            <Text color="text-color-3" variant="text-xs-medium">
              Cijena
            </Text>
            <Text className="text-green-500 dark:text-green-400" variant="text-l-medium">
              {shipment.price}€
            </Text>
          </FlexLayout>
          {transportPrice !== undefined && ruc !== undefined && (
            <>
              <FlexLayout className="items-center justify-between">
                <Text color="text-color-3" variant="text-xs-medium">
                  Cijena transporta
                </Text>
                <Text className="text-red-500 dark:text-red-400" variant="text-l-medium">
                  -{transportPrice}€
                </Text>
              </FlexLayout>
              <Divider />
              <FlexLayout className="items-center justify-between">
                <Text color="text-color-3" variant="text-xs-medium">
                  RUC
                </Text>
                <Text className={rucClass} variant="text-l-medium">
                  {ruc}€
                </Text>
              </FlexLayout>
            </>
          )}
        </FlexLayout>
      </Box>

      <NoteCard
        note={shipment.internalNote}
        title="Interna napomena"
        tooltip="Ova napomena je samo za internu upotrebu i ne pojavljuje se u PDF-ovima ni drugim izlaznim dokumentima."
        onEdit={() => setEditingNoteType('internal')}
      />
      <NoteCard
        note={shipment.externalNote}
        title="Vanjska napomena"
        tooltip="Ova napomena je vidljiva u PDF-ovima i drugim izlaznim dokumentima koji se šalju vanjskim primateljima."
        onEdit={() => setEditingNoteType('external')}
      />

      {!isAgency && (
        <Box className={cardClass}>
          {isAssigned && shipment.vehicleStops ? (
            <ShipmentVehicleStops stops={shipment.vehicleStops} />
          ) : (
            <EmptyShipmentVehicleStops onAssignClick={onAssignClick} />
          )}
        </Box>
      )}

      <ShipmentNoteModal
        childShipmentId={child?.id}
        initialNote={editingNoteType === 'external' ? shipment.externalNote : shipment.internalNote}
        isOpen={editingNoteType !== null}
        noteType={editingNoteType ?? 'internal'}
        shipmentId={shipment.id}
        onClose={() => setEditingNoteType(null)}
      />
    </FlexLayout>
  );
};

interface NoteCardProps {
  title: string;
  tooltip: string;
  note?: string;
  onEdit(): void;
}

const NoteCard: React.FC<NoteCardProps> = ({ title, tooltip, note, onEdit }) => (
  <Box className={cardClass}>
    <FlexLayout className="flex-col gap-2">
      <FlexLayout className="items-center justify-between">
        <FlexLayout className="items-center gap-2 text-dark-700 dark:text-light-100">
          <Text variant="text-m-medium">{title}</Text>
          <Tooltip
            content={
              <Box className="px-2 max-w-[260px]">
                <Text as="p" color="text-light-50" variant="text-xs">
                  {tooltip}
                </Text>
              </Box>
            }
          >
            <Box className="cursor-default">
              <Icon icon="IconInfoCircle" />
            </Box>
          </Tooltip>
        </FlexLayout>
        {note && (
          <TextButton iconRight="IconPencil" size="s" text="Uredi napomenu" variant="secondary" onClick={onEdit} />
        )}
      </FlexLayout>
      {note ? (
        <Text className="whitespace-pre-wrap" color="text-color-1" variant="text-s">
          {note}
        </Text>
      ) : (
        <Box className="relative">
          <FlexLayout className="flex-col gap-3 py-1 opacity-70">
            <Box className="rounded-xs bg-dark-200/40 dark:bg-light-800/40 h-[16px] w-[80%]" />
            <Box className="rounded-xs bg-dark-200/40 dark:bg-light-800/40 h-[16px] w-[60%]" />
            <Box className="rounded-xs bg-dark-200/40 dark:bg-light-800/40 h-[16px] w-[70%]" />
          </FlexLayout>
          <FlexLayout className="absolute inset-0 items-center justify-center">
            <TextButton iconLeft="IconPlus" text="Dodaj napomenu" variant="secondary" onClick={onEdit} />
          </FlexLayout>
        </Box>
      )}
    </FlexLayout>
  </Box>
);

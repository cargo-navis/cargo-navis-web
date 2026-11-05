import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { InvoiceStatus, Shipment } from '@/lib/api';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import {
  useClient,
  useContractor,
  useCurrentTenant,
  useShipment,
  useUpdateAgencyShipment,
  useUpdateShipment,
} from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, Divider, FlexLayout, Icon, Pill, Text } from '@/ui';

import { invoiceStatusConfig } from '../const';
import { AssignVehicleModal } from '../NewShipmentPage/AssignVehicleModal';
import { OverdueIndicator } from '../OverdueIndicator';
import { CargoItem } from './components/CargoItem';
import { ContentLoader } from './components/ContentLoader';
import { InvoiceItem } from './components/InvoiceItem';
import { NotifyDriversButton } from './components/NotifyDriversButton';
import { ShipmentActions } from './components/ShipmentActions';
import { ShipmentFiles } from './components/ShipmentFiles';
import { ShipmentLeftPanel } from './components/ShipmentLeftPanel';
import type { CargoWithMetadata } from './components/types';

export const SingleShipmentPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: shipment, isLoading } = useShipment(id as string);

  return (
    <DashboardLayout>
      <PageTitle title={shipment?.orderNumber} type="Nalog" />
      {!shipment || isLoading ? (
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      ) : (
        <Box>
          <MainContent shipment={shipment} />
        </Box>
      )}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ shipment: Shipment }> = ({ shipment }) => {
  const { push } = useRouter();
  const { isAgency } = shipment;

  const { mutateAsync: updateShipment, isPending: isUpdatingShipment } = useUpdateShipment();
  const { mutateAsync: updateAgencyShipment, isPending: isUpdatingAgencyShipment } = useUpdateAgencyShipment();

  const isPending = isUpdatingShipment || isUpdatingAgencyShipment;

  const { data: client } = useClient(shipment.clientId || '');
  const { data: tenant } = useCurrentTenant();

  const isAssigned = (shipment.vehicleStops?.length ?? 0) > 0;

  // For an agency shipment this is already the external carrier the order was
  // forwarded to, not the tenant.
  const transporterId = shipment.transportContractorId;
  const { data: contractor } = useContractor(transporterId || '');
  const transporter = contractor ?? (transporterId === tenant?.id ? tenant : undefined);
  const transporterHref = contractor ? `/dashboard/contractors/${contractor.id}` : '/dashboard/tenant';

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleInvoiceChange = async (invoiceStatus: InvoiceStatus) => {
    try {
      if (isAgency) {
        await updateAgencyShipment({ id: shipment.id, invoiceStatus });
      } else {
        await updateShipment({ id: shipment.id, invoiceStatus });
      }

      const invoiceStatusText = invoiceStatusConfig[invoiceStatus].label.toUpperCase();
      showSuccessToast({
        title: `Nalog označen kao ${invoiceStatusText}`,
      });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom ažuriranja fakture. Pokušajte ponovno.' });
    }
  };

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <FlexLayout className="justify-between">
        <BackButton targetLocation="/dashboard/shipments" />
        <FlexLayout className="items-center gap-3">
          {!isAgency &&
            (isAssigned ? (
              <NotifyDriversButton shipment={shipment} />
            ) : (
              <Button
                iconLeft="IconTruck"
                text="Dodijeli vozilo"
                variant="secondary"
                onClick={() => setIsAssignModalOpen(true)}
              />
            ))}
          <ShipmentActions shipment={shipment} />
        </FlexLayout>
      </FlexLayout>
      {!isAgency && isAssignModalOpen && (
        <AssignVehicleModal
          cargos={shipment.cargo}
          clientId={shipment.clientId}
          isOpen={isAssignModalOpen}
          shipmentId={shipment.id}
          shipmentOrderNumber={shipment.orderNumber}
          onAssigned={(vehicleId) => {
            setIsAssignModalOpen(false);
            void push(`/dashboard/vehicle-stops/${vehicleId}`);
          }}
          onClose={() => setIsAssignModalOpen(false)}
        />
      )}
      <Box className="max-w-[1400px]">
        <FlexLayout className="relative flex-col gap-5 w-full">
          <FlexLayout className="flex-col gap-4">
            <FlexLayout className="flex-col gap-1">
              <FlexLayout className="items-center justify-between">
                <FlexLayout className="flex-col">
                  <FlexLayout className="items-center gap-4">
                    <Text as="h1" color="text-color-1" variant="text-xl-bold">
                      {shipment.orderNumber}
                    </Text>
                    {isAgency && <Pill size="s" text="Agencijski nalog" variant="warning" />}
                    <OverdueIndicator shipment={shipment} />
                  </FlexLayout>
                  <FlexLayout className="flex-wrap items-center gap-3 text-dark-600 dark:text-light-300">
                    <Link
                      className="flex items-center gap-1 hover:text-teal-500 transition-colors"
                      href={`/dashboard/clients/${client?.id}`}
                    >
                      <Icon icon="IconBriefcase" size="m" />
                      <Text variant="text-m">{client?.name ?? '—'}</Text>
                    </Link>
                    {transporter && (
                      <>
                        <Text variant="text-m">•</Text>
                        <Link
                          className="flex items-center gap-1 hover:text-teal-500 transition-colors"
                          href={transporterHref}
                        >
                          <Icon icon="IconTruck" size="m" />
                          <Text variant="text-m">{transporter.name}</Text>
                        </Link>
                      </>
                    )}
                  </FlexLayout>
                </FlexLayout>
                <InvoiceItem
                  invoiceStatus={shipment.invoiceStatus}
                  invoiceStatusUpdatedAt={shipment.invoiceStatusUpdatedAt}
                  isPending={isPending}
                  onChange={handleInvoiceChange}
                />
              </FlexLayout>
              <ShipmentFiles isDisabled={isPending} shipment={shipment} />
            </FlexLayout>
          </FlexLayout>
          <Divider />
          <FlexLayout className="flex-row gap-5">
            <FlexLayout className="w-[380px] flex-col gap-4">
              <ShipmentLeftPanel shipment={shipment} onAssignClick={() => setIsAssignModalOpen(true)} />
            </FlexLayout>
            <FlexLayout as="section" className="flex-1 flex-col gap-4 min-w-0">
              <Text color="text-color-2" variant="text-l-medium">
                Tereti
              </Text>
              {(shipment.cargo as CargoWithMetadata[]).map((item, index) => (
                <CargoItem
                  cargo={item}
                  index={index}
                  isAgency={isAgency}
                  key={shipment.cargo[index].id}
                  shipmentId={shipment.id}
                />
              ))}
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};

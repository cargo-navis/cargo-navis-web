import { addToast } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useContractor, useCurrentTenant, useEmployee, useShipment, useUpdateShipment, useVehicle } from '@/lib/hooks';
import { vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { Box, DisplayIf, Divider, FlexLayout, Icon, Pill, Text } from '@/ui';

import { loadStatusConfig } from '../const';
import { AddressDetailsItem } from './components/AddressDetailsItem';
import { CargoItem } from './components/CargoItem';
import { ClientItem } from './components/ClientItem';
import { DateItem } from './components/DateItem';
import { DescriptionItem } from './components/DescriptionItem';
import { LoadStatusProgress } from './components/LoadStatusProgress';
import { ShipmentActions } from './components/ShipmentActions';
import type { CargoWithMetadata } from './components/types';

export const SingleShipmentPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: shipment, isLoading } = useShipment(id as string);

  return (
    <DashboardLayout>
      {!shipment || isLoading ? (
        <LoadingPage />
      ) : (
        <Box>
          <MainContent shipment={shipment} />
        </Box>
      )}
    </DashboardLayout>
  );
};

const MainContent: React.FC<{ shipment: Shipment }> = ({ shipment }) => {
  const { data: tenant } = useCurrentTenant();
  const { data: contractor } = useContractor(shipment.transportContractorId || '');

  const { data: driver } = useEmployee(shipment.driverId || '');
  const { data: vehicle } = useVehicle(shipment.vehicleId || '');
  const { data: trailer } = useVehicle(shipment.trailerId || '');
  const { data: dispatcher } = useEmployee(shipment.dispatcherId || '');
  const { data: parentShipment } = useShipment(shipment.parentShipmentId || '');
  const { mutate: updateShipment, isPending } = useUpdateShipment();

  let transporter: any = contractor;

  if (!contractor && shipment.transportContractorId === tenant?.id) {
    transporter = tenant;
  }

  const transporterHref = contractor ? `/dashboard/contractors/${contractor?.id}` : `/dashboard/tenant`;

  const handleLoadStatusChange = (status: LoadStatus) => {
    try {
      updateShipment({
        id: shipment.id,
        loadStatus: status,
      });

      const statusText = loadStatusConfig[status].label;

      addToast({
        title: 'Status naloga ažuriran:',
        description: statusText.toUpperCase(),
        timeout: 2500,
        classNames: {
          base: 'bg-teal-700 text-white border border-teal-600',
          content: 'text-white',
          description: 'text-white',
          title: 'text-white',
          closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
        },
        radius: 'sm',
        icon: <Icon color="text-white" icon="InformationCircleIcon" size="xl" />,
        closeIcon: (
          <FlexLayout className="bg-teal-700 p-1 items-center justify-center">
            <Icon color="text-white" icon="XMarkIcon" size="l" />
          </FlexLayout>
        ),
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Greška prilikom ažuriranja statusa utovara. Pokušajte ponovno.',
        classNames: {
          base: 'bg-red-600 dark:bg-red-700 text-white border border-red-600',
          content: 'text-white',
          description: 'text-white',
          title: 'text-white',
          closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
        },
        timeout: 2500,
        radius: 'sm',
        icon: <Icon color="text-white" icon="ExclamationTriangleIcon" size="xl" />,
        closeIcon: (
          <FlexLayout className="bg-red-600 dark:bg-red-700 p-1 items-center justify-center">
            <Icon color="text-white" icon="XMarkIcon" size="l" />
          </FlexLayout>
        ),
      });
    }
  };

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <FlexLayout className="justify-between">
        <BackButton targetLocation="/dashboard/shipments" />
        <ShipmentActions id={shipment.id} />
      </FlexLayout>
      <Box className="max-w-[1400px]">
        <FlexLayout className="relative flex-col gap-7 w-full">
          <FlexLayout className="flex-col gap-4">
            <FlexLayout className="flex-col gap-1">
              <FlexLayout className="items-center gap-4">
                <Text as="h1" variant="text-xl-medium">
                  Nalog #{shipment.orderNumber}
                </Text>
              </FlexLayout>
              {shipment.parentShipmentId && parentShipment && (
                <Link className="max-w-max" href={`/dashboard/shipments/${parentShipment.id}`}>
                  <Text className="hover:text-teal-500 transition-colors" color="text-color-3" variant="text-s">
                    Podnalog od #{parentShipment.orderNumber}
                  </Text>
                </Link>
              )}
            </FlexLayout>
            <DisplayIf condition={!shipment?.isAgencyUse} fallback={<Pill text="Agencijski Nalog" variant="warning" />}>
              <LoadStatusProgress
                currentStatus={shipment.loadStatus || LoadStatus.NotYetLoaded}
                isPending={isPending}
                onStatusChange={handleLoadStatusChange}
              />
            </DisplayIf>
          </FlexLayout>
          <FlexLayout className="flex-row gap-7">
            <FlexLayout className="flex-1 flex-col gap-4">
              <FlexLayout as="section" className="flex-col gap-5">
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Broj naloga
                      </Text>
                      <Text variant="text-l">{shipment.orderNumber}</Text>
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Referentni broj
                      </Text>
                      <Text variant="text-l">{shipment.cargoReference || '-'}</Text>
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                <Box className="flex-1">
                  <FlexLayout className="flex-col">
                    <Text color="text-color-3" variant="text-s-medium">
                      Prijevoznik
                    </Text>
                    <Link className="hover:text-teal-500 transition-colors max-w-max" href={transporterHref || '#'}>
                      <Text variant="text-l">{transporter?.name || '-'}</Text>
                    </Link>
                  </FlexLayout>
                </Box>

                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <ClientItem clientId={shipment.clientId || ''} />
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Cijena
                      </Text>
                      <Text variant="text-l">{shipment.price}€</Text>
                    </FlexLayout>
                  </Box>
                </FlexLayout>
                <FlexLayout className="flex-col">
                  <Text color="text-color-3" variant="text-s-medium">
                    Vozač
                  </Text>
                  <Link
                    className="hover:text-teal-500 transition-colors max-w-max"
                    href={driver?.id ? `/dashboard/employees/${driver?.id}` : '#'}
                  >
                    <Text variant="text-l">{driver ? `${driver.firstName} ${driver.lastName}` : '-'}</Text>
                  </Link>
                </FlexLayout>
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Vozilo
                      </Text>
                      <Link
                        className="hover:text-teal-500 transition-colors max-w-max"
                        href={
                          vehicle?.id ? `/dashboard/fleet/${vehicleTypeToPathMap[vehicle?.type]}/${vehicle?.id}` : '#'
                        }
                      >
                        <Text variant="text-l">{vehicle ? `${vehicle?.registration} (${vehicle?.brand})` : '-'}</Text>
                      </Link>
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Priključno vozilo
                      </Text>
                      <Link
                        className="hover:text-teal-500 transition-colors max-w-max"
                        href={
                          trailer?.id ? `/dashboard/fleet/${vehicleTypeToPathMap[trailer?.type]}/${trailer?.id}` : '#'
                        }
                      >
                        <Text variant="text-l">{trailer ? `${trailer?.registration} (${trailer?.brand})` : '-'}</Text>
                      </Link>
                    </FlexLayout>
                  </Box>
                </FlexLayout>
                <Box className="flex-1">
                  <FlexLayout className="flex-col">
                    <Text color="text-color-3" variant="text-s-medium">
                      Disponent
                    </Text>
                    <Link
                      className="hover:text-teal-500 transition-colors max-w-max"
                      href={dispatcher?.id ? `/dashboard/employees/${dispatcher?.id}` : '#'}
                    >
                      <Text variant="text-l">
                        {dispatcher ? `${dispatcher.firstName} ${dispatcher.lastName}` : '-'}
                      </Text>
                    </Link>
                  </FlexLayout>
                </Box>
              </FlexLayout>

              <Box className="py-4">
                <Divider />
              </Box>

              <FlexLayout as="section" className="flex-col gap-5">
                <FlexLayout className="gap-4">
                  <FlexLayout className="flex-col flex-1 gap-4">
                    <Text color="text-color-3" variant="text-s-medium">
                      Detalji utovara
                    </Text>
                    <AddressDetailsItem address={shipment.loadingAddress} companyName={shipment.loadingCompanyName} />
                    <DateItem date={shipment.loadingDate} label="Datum utovara" />
                    <DateItem date={shipment.loadingReadyDate} label="Datum spremnosti za utovar" />
                    <DescriptionItem description={shipment.loadingDescription} label="Opis utovara:" />
                  </FlexLayout>
                  <FlexLayout className="flex-col flex-1 gap-4">
                    <Text color="text-color-3" variant="text-s-medium">
                      Detalji istovara
                    </Text>
                    <AddressDetailsItem
                      address={shipment.unloadingAddress}
                      companyName={shipment.unloadingCompanyName}
                    />
                    <DateItem date={shipment.unloadingDate} label="Datum istovara" />
                    <DateItem date={shipment.unloadingDueDate} label="Krajnji rok istovara" />
                    <DescriptionItem description={shipment.unloadingDescription} label="Opis istovara:" />
                  </FlexLayout>
                </FlexLayout>
              </FlexLayout>
            </FlexLayout>

            <FlexLayout as="section" className="flex-1 flex-col gap-4">
              <Text variant="text-l-medium">Teret</Text>
              {(shipment.cargo as CargoWithMetadata[]).map((item, index) => (
                <CargoItem cargo={item} index={index} key={index} />
              ))}
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};

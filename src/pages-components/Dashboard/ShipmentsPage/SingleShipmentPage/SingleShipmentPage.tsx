import Link from 'next/link';
import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClient, useContractor, useCurrentTenant, useEmployee, useShipment, useVehicle } from '@/lib/hooks';
import { vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Divider, FlexLayout, Text } from '@/ui';

import { AddressItem } from './components/AddressItem';
import { CargoItem } from './components/CargoItem';
import { DateItem } from './components/DateItem';
import { DescriptionItem } from './components/DescriptionItem';
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
  const { data: client } = useClient(shipment.clientId || '');
  const { data: driver } = useEmployee(shipment.driverId || '');
  const { data: vehicle } = useVehicle(shipment.vehicleId || '');
  const { data: dispatcher } = useEmployee(shipment.dispatcherId || '');

  let transporter: any = contractor;

  if (!contractor && shipment.transportContractorId === tenant?.id) {
    transporter = tenant;
  }

  const transporterHref = contractor ? `/dashboard/contractors/${contractor?.id}` : `/dashboard/tenant`;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <FlexLayout className="justify-between">
        <BackButton targetLocation="/dashboard/shipments" />
        <ShipmentActions id={shipment.id} />
      </FlexLayout>
      <Box className="max-w-[1400px]">
        <FlexLayout className="relative flex-col gap-7 w-full">
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
                    <Link className="hover:text-teal-500 transition-colors" href={transporterHref || '#'}>
                      <Text variant="text-l">{transporter?.name || '-'}</Text>
                    </Link>
                  </FlexLayout>
                </Box>

                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Klijent
                      </Text>
                      <Link
                        className="hover:text-teal-500 transition-colors"
                        href={client?.id ? `/dashboard/clients/${client?.id}` : '#'}
                      >
                        <Text variant="text-l">{client?.name || '-'}</Text>
                      </Link>
                    </FlexLayout>
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
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Vozač
                      </Text>
                      <Link
                        className="hover:text-teal-500 transition-colors"
                        href={driver?.id ? `/dashboard/employees/${driver?.id}` : '#'}
                      >
                        <Text variant="text-l">{driver ? `${driver.firstName} ${driver.lastName}` : '-'}</Text>
                      </Link>
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Vozilo
                      </Text>
                      <Link
                        className="hover:text-teal-500 transition-colors"
                        href={
                          vehicle?.id ? `/dashboard/fleet/${vehicleTypeToPathMap[vehicle?.type]}/${vehicle?.id}` : '#'
                        }
                      >
                        <Text variant="text-l">{vehicle ? `${vehicle?.registration} (${vehicle?.brand})` : '-'}</Text>
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
                      className="hover:text-teal-500 transition-colors"
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
                    <AddressItem address={shipment.loadingAddress} />
                    <DateItem date={shipment.loadingDate} label="Datum utovara" />
                    <DateItem date={shipment.loadingReadyDate} label="Datum spremnosti za utovar" />
                    <DescriptionItem description={shipment.loadingDescription} label="Opis utovara:" />
                  </FlexLayout>
                  <FlexLayout className="flex-col flex-1 gap-4">
                    <Text color="text-color-3" variant="text-s-medium">
                      Detalji istovara
                    </Text>
                    <AddressItem address={shipment.unloadingAddress} />
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

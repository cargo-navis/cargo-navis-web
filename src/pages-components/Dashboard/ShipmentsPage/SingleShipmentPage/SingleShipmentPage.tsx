import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Cargo, LoadingAddress, Shipment } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useClient, useContractor, useEmployee, useShipment, useVehicle } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, Divider, FlexLayout, Text } from '@/ui';

import { AddressItem } from './components/AddressItem';
import { DateItem } from './components/DateItem';
import { DescriptionItem } from './components/DescriptionItem';

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
  const { data: contractor } = useContractor(shipment.transportContractorId || '');
  const { data: client } = useClient(shipment.clientId || '');
  const { data: driver } = useEmployee(shipment.driverId || '');
  const { data: vehicle } = useVehicle(shipment.vehicleId || '');
  const { data: dispatcher } = useEmployee(shipment.dispatcherId || '');

  console.log(shipment);

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <BackButton targetLocation="/dashboard/shipments" />
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
                    <Text variant="text-l">{contractor?.name || '-'}</Text>
                  </FlexLayout>
                </Box>

                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Klijent
                      </Text>
                      <Text variant="text-l">{client?.name || '-'}</Text>
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Cijena (Euro)
                      </Text>
                      <Text variant="text-l">{shipment.price}</Text>
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Vozač
                      </Text>
                      <Text variant="text-l">{driver ? `${driver.firstName} ${driver.lastName}` : '-'}</Text>
                    </FlexLayout>
                  </Box>
                  <Box className="flex-1">
                    <FlexLayout className="flex-col">
                      <Text color="text-color-3" variant="text-s-medium">
                        Vozilo
                      </Text>
                      <Text variant="text-l">{vehicle ? `${vehicle?.registration} (${vehicle?.brand})` : '-'}</Text>
                    </FlexLayout>
                  </Box>
                </FlexLayout>

                <Box className="flex-1">
                  <FlexLayout className="flex-col">
                    <Text color="text-color-3" variant="text-s-medium">
                      Disponent
                    </Text>
                    <Text variant="text-l">{dispatcher ? `${dispatcher.firstName} ${dispatcher.lastName}` : '-'}</Text>
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
                    <AddressItem address={shipment.loadingAddressName as LoadingAddress} />
                    <DateItem date={shipment.loadingDate} label="Datum utovara" />
                    <DateItem date={shipment.loadingReadyDate} label="Datum spremnosti za utovar" />
                    <DescriptionItem description={shipment.loadingDescription} label="Opis utovara:" />
                  </FlexLayout>
                  <FlexLayout className="flex-col flex-1 gap-4">
                    <Text color="text-color-3" variant="text-s-medium">
                      Detalji istovara
                    </Text>
                    <AddressItem address={shipment.unloadingAddressName as LoadingAddress} />
                    <DateItem date={shipment.unloadingDate} label="Datum istovara" />
                    <DateItem date={shipment.unloadingDueDate} label="Krajnji rok istovara" />
                    <DescriptionItem description={shipment.unloadingDescription} label="Opis istovara:" />
                  </FlexLayout>
                </FlexLayout>
              </FlexLayout>
            </FlexLayout>

            <FlexLayout as="section" className="flex-1 flex-col gap-4">
              <Text variant="text-l-medium">Teret</Text>
              {(shipment.cargo as Cargo[]).map((item, index) => (
                <Box className="border p-4 rounded-md" key={index}>
                  <FlexLayout className="flex-col gap-2">
                    <FlexLayout className="justify-between">
                      <Text color="text-color-3" variant="text-s-medium">
                        Opis
                      </Text>
                      <Text>{item.description}</Text>
                    </FlexLayout>
                    <FlexLayout className="justify-between">
                      <Text color="text-color-3" variant="text-s-medium">
                        LDM
                      </Text>
                      <Text>{item.ldm}</Text>
                    </FlexLayout>
                    <FlexLayout className="justify-between">
                      <Text color="text-color-3" variant="text-s-medium">
                        Težina (kg)
                      </Text>
                      <Text>{item.weight}</Text>
                    </FlexLayout>
                  </FlexLayout>
                </Box>
              ))}
            </FlexLayout>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};

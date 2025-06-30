import Link from 'next/link';
import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InvoiceStatus, LoadStatus, Shipment } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useContractor, useCurrentTenant, useEmployee, useShipment, useUpdateShipment, useVehicle } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { renderVehicleName, vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { Box, Divider, FlexLayout, Pill, Text } from '@/ui';

import { invoiceStatusConfig, loadStatusConfig } from '../const';
import { AddressDetailsItem } from './components/AddressDetailsItem';
import { CargoItem } from './components/CargoItem';
import { ClientItem } from './components/ClientItem';
import { DateItem } from './components/DateItem';
import { DescriptionItem } from './components/DescriptionItem';
import { InvoiceItem } from './components/InvoiceItem';
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
  const { mutateAsync: updateShipment, isPending } = useUpdateShipment();

  let transporter: any = contractor;

  if (!contractor && shipment.transportContractorId === tenant?.id) {
    transporter = tenant;
  }

  const transporterHref = contractor ? `/dashboard/contractors/${contractor?.id}` : `/dashboard/tenant`;

  const handleLoadStatusChange = async (status: LoadStatus) => {
    try {
      await updateShipment({
        id: shipment.id,
        loadStatus: status,
      });

      const statusText = loadStatusConfig[status].label;

      showSuccessToast({ title: 'Status naloga ažuriran:', description: statusText.toUpperCase() });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom ažuriranja statusa utovara. Pokušajte ponovno.' });
    }
  };

  const handleInvoiceChange = async (invoiceStatus: InvoiceStatus) => {
    try {
      await updateShipment({
        id: shipment.id,
        invoiceStatus,
      });

      const invoiceStatusText = invoiceStatusConfig[invoiceStatus].label.toUpperCase();
      showSuccessToast({
        title: `Nalog označen kao ${invoiceStatusText}`,
      });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom ažuriranja fakture. Pokušajte ponovno.' });
    }
  };

  const shouldRenderAgencyPill = !!shipment?.isAgencyUse && !shipment?.parentShipmentId;

  return (
    <FlexLayout className="py-5 flex-col gap-5">
      <FlexLayout className="justify-between">
        <BackButton targetLocation="/dashboard/shipments" />
        <ShipmentActions id={shipment.id} />
      </FlexLayout>
      <Box className="max-w-[1400px]">
        <FlexLayout className="relative flex-col gap-5 w-full">
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
            <FlexLayout className="items-baseline justify-between">
              {shouldRenderAgencyPill ? (
                <Pill text="Agencijski Nalog" variant="warning" />
              ) : (
                <LoadStatusProgress
                  currentStatus={shipment.loadStatus || LoadStatus.NotYetLoaded}
                  isPending={isPending}
                  onStatusChange={handleLoadStatusChange}
                />
              )}
              <InvoiceItem
                invoiceStatus={shipment.invoiceStatus}
                isPending={isPending}
                onChange={handleInvoiceChange}
              />
            </FlexLayout>
          </FlexLayout>
          <Divider />
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
                    <Text variant="text-l">{driver ? `${driver.fullName}` : '-'}</Text>
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
                        <Text variant="text-l">{vehicle ? renderVehicleName(vehicle) : '-'}</Text>
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
                        <Text variant="text-l">{trailer ? renderVehicleName(trailer) : '-'}</Text>
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
                      <Text variant="text-l">{dispatcher ? `${dispatcher.fullName}` : '-'}</Text>
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

import Link from 'next/link';

import { Shipment } from '@/lib/api';
import { useContractor, useCurrentTenant, useEmployee, useVehicle } from '@/lib/hooks';
import { renderVehicleName, vehicleTypeToPathMap } from '@/lib/utils/vehicles';
import { Box, FlexLayout, Text } from '@/ui';

import { ClientItem } from './ClientItem';

export const BasicInfo = ({ shipment }: { shipment: Shipment }) => {
  const { data: tenant } = useCurrentTenant();
  const { data: driver } = useEmployee(shipment.driverId || '');
  const { data: vehicle } = useVehicle(shipment.vehicleId || '');
  const { data: trailer } = useVehicle(shipment.trailerId || '');
  const { data: dispatcher } = useEmployee(shipment.dispatcherId || '');
  const { data: contractor } = useContractor(shipment.transportContractorId || '');

  let transporter: any = contractor;

  if (!contractor && shipment.transportContractorId === tenant?.id) {
    transporter = tenant;
  }

  const transporterHref = contractor ? `/dashboard/contractors/${contractor?.id}` : `/dashboard/tenant`;

  return (
    <FlexLayout as="section" className="flex-col gap-5">
      <Text color="text-color-2" variant="text-l-medium">
        Osnovni podaci
      </Text>
      <FlexLayout className="gap-4">
        <Box className="flex-1">
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-xs-medium">
              Broj naloga
            </Text>
            <Text color="text-color-1" variant="text-m-medium">
              {shipment.orderNumber}
            </Text>
          </FlexLayout>
        </Box>
        <Box className="flex-1">
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-xs-medium">
              Referentni broj
            </Text>
            <Text color="text-color-1" variant="text-m-medium">
              {shipment.cargoReference || '—'}
            </Text>
          </FlexLayout>
        </Box>
      </FlexLayout>

      <Box className="flex-1">
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-xs-medium">
            Prijevoznik
          </Text>
          <Link className="hover:text-teal-500 transition-colors max-w-max" href={transporterHref || '#'}>
            <Text color="text-color-1" variant="text-m-medium">
              {transporter?.name || '—'}
            </Text>
          </Link>
        </FlexLayout>
      </Box>

      <FlexLayout className="gap-4">
        <Box className="flex-1">
          <ClientItem clientId={shipment.clientId || ''} />
        </Box>
        <Box className="flex-1">
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-xs-medium">
              Cijena
            </Text>
            <Text className="text-green-500 dark:text-green-400" variant="text-m-medium">
              {shipment.price}€
            </Text>
          </FlexLayout>
        </Box>
      </FlexLayout>
      <FlexLayout className="flex-col">
        <Text color="text-color-3" variant="text-xs-medium">
          Vozač
        </Text>
        <Link
          className="hover:text-teal-500 transition-colors max-w-max"
          href={driver?.id ? `/dashboard/employees/${driver?.id}` : '#'}
        >
          <Text color="text-color-1" variant="text-m-medium">
            {driver ? `${driver.fullName}` : '—'}
          </Text>
        </Link>
      </FlexLayout>
      <FlexLayout className="gap-4">
        <Box className="flex-1">
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-xs-medium">
              Vozilo
            </Text>
            <Link
              className="hover:text-teal-500 transition-colors max-w-max"
              href={vehicle?.id ? `/dashboard/fleet/${vehicleTypeToPathMap[vehicle?.type]}/${vehicle?.id}` : '#'}
            >
              <Text color="text-color-1" variant="text-m-medium">
                {vehicle ? renderVehicleName(vehicle) : '—'}
              </Text>
            </Link>
          </FlexLayout>
        </Box>
        <Box className="flex-1">
          <FlexLayout className="flex-col">
            <Text color="text-color-3" variant="text-xs-medium">
              Priključno vozilo
            </Text>
            <Link
              className="hover:text-teal-500 transition-colors max-w-max"
              href={trailer?.id ? `/dashboard/fleet/${vehicleTypeToPathMap[trailer?.type]}/${trailer?.id}` : '#'}
            >
              <Text color="text-color-1" variant="text-m-medium">
                {trailer ? renderVehicleName(trailer) : '—'}
              </Text>
            </Link>
          </FlexLayout>
        </Box>
      </FlexLayout>
      <Box className="flex-1">
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-xs-medium">
            Disponent
          </Text>
          <Link
            className="hover:text-teal-500 transition-colors max-w-max"
            href={dispatcher?.id ? `/dashboard/employees/${dispatcher?.id}` : '#'}
          >
            <Text color="text-color-1" variant="text-m-medium">
              {dispatcher ? `${dispatcher.fullName}` : '—'}
            </Text>
          </Link>
        </FlexLayout>
      </Box>
    </FlexLayout>
  );
};

import Link from 'next/link';

import { Shipment } from '@/lib/api';
import { useContractor, useCurrentTenant } from '@/lib/hooks';
import { Box, FlexLayout, Text } from '@/ui';

export const BasicInfo = ({ shipment }: { shipment: Shipment }) => {
  const { data: tenant } = useCurrentTenant();
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
              Cijena
            </Text>
            <Text className="text-green-500 dark:text-green-400" variant="text-l-medium">
              {shipment.price}€
            </Text>
          </FlexLayout>
        </Box>
      </FlexLayout>
      <Box className="flex-1">
        <FlexLayout className="flex-col">
          <Text color="text-color-3" variant="text-xs-medium">
            Prijevoznik
          </Text>
          <Link
            className="text-dark-800 dark:text-light-50 hover:text-teal-500 transition-colors max-w-max"
            href={transporterHref || '#'}
          >
            <Text variant="text-m-medium">{transporter?.name || '—'}</Text>
          </Link>
        </FlexLayout>
      </Box>
      <FlexLayout className="gap-4">
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
    </FlexLayout>
  );
};

import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';

import { LoadingAddress } from '@/lib/api/shipments.d';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, FlexLayout, Icon, IconType, Text, Tooltip } from '@/ui';

const formatAddress = (address: LoadingAddress) => {
  if (!address) return '—';
  return `${address.postalCode} ${address.placeName}, ${address.countryCode}`;
};

export const AddressesList = ({ addresses, icon }: { addresses: LoadingAddress[]; icon: IconType }) => {
  const uniqAddresses = uniqBy(compact(addresses), (a) => `${a.countryCode}-${a.placeName}`);
  // const isMultipleLoadingAddresses = uniqueLoadingAddresses.length > 1;

  return uniqAddresses.map((address: LoadingAddress) => {
    if (!address)
      return (
        <Text color="text-color-3" variant="text-xs">
          —
        </Text>
      );

    return (
      <Tooltip
        content={
          <Box className="px-1">
            <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
              {address.streetName}
            </Text>
            <br />
            <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
              {address.postalCode}, {address.placeName},
            </Text>
            <br />
            <Text color="text-light-50" variant="text-xs">
              {getCountryFromCode(address.countryCode)?.name}
            </Text>
          </Box>
        }
        key={address.id}
      >
        <FlexLayout className="items-center gap-1">
          <Icon color="text-color-3" icon={icon} size="s" />
          <Text className="whitespace-nowrap overflow-hidden text-ellipsis" color="text-color-3" variant="text-xs">
            {formatAddress(address)}
          </Text>
        </FlexLayout>
      </Tooltip>
    );
  });
};

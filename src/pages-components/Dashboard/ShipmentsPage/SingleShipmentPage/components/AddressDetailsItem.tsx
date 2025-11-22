import type { LoadingAddress } from '@/lib/api';
import { FlexLayout, Text } from '@/ui';

import { getCountryFromCode } from '../../../NewEmployeePage/const';

export const AddressDetailsItem: React.FC<{ address: LoadingAddress }> = ({ address }) => {
  const addressString: string[] = [];

  if (address.postalCode) addressString.push(address.postalCode);
  if (address.placeName) addressString.push(address.placeName);
  if (address.countryCode) addressString.push(getCountryFromCode(address?.countryCode || '')?.name);

  return (
    <FlexLayout className="flex-col gap-1 text-end">
      <Text color="text-color-3" variant="text-xs-medium">
        Adresa
      </Text>
      <FlexLayout className="flex-col">
        <Text color="text-color-1" variant="text-s">
          {address.streetName}
        </Text>
        <Text color="text-color-1" variant="text-s">
          {addressString.join(', ')}
        </Text>
      </FlexLayout>
    </FlexLayout>
  );
};

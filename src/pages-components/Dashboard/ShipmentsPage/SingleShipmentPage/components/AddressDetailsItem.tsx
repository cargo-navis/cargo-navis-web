import type { LoadingAddress } from '@/lib/api';
import { FlexLayout, Text } from '@/ui';

import { getCountryFromCode } from '../../../NewEmployeePage/const';

export const AddressDetailsItem: React.FC<{ address: LoadingAddress }> = ({ address }) => {
  return (
    <FlexLayout className="flex-col">
      <Text variant="text-m">{address?.streetName}</Text>
      <FlexLayout>
        <Text variant="text-m">{address?.postalCode},&nbsp;</Text>
        <Text variant="text-m">{address?.city}</Text>
      </FlexLayout>
      <Text variant="text-m">{getCountryFromCode(address?.countryCode || '')?.name}</Text>
    </FlexLayout>
  );
};

import type { LoadingAddress } from '@/lib/api';
import { DisplayIf, FlexLayout, Text } from '@/ui';

import { getCountryFromCode } from '../../../NewEmployeePage/const';

export const AddressDetailsItem: React.FC<{ address: LoadingAddress; companyName?: string }> = ({
  address,
  companyName,
}) => {
  return (
    <FlexLayout className="flex-col">
      <DisplayIf condition={!!companyName}>
        <Text variant="text-m">{companyName} / </Text>
      </DisplayIf>
      <Text variant="text-m">{address?.streetName}</Text>
      <Text variant="text-m">
        {address?.postalCode}, {address?.placeName}
      </Text>
      <Text variant="text-m">{getCountryFromCode(address?.countryCode || '')?.name}</Text>
    </FlexLayout>
  );
};

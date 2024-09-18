import type { Vehicle } from '@/lib/api';
import { Divider, FlexLayout, Text } from '@/ui';

import { InfoItem } from './InfoItem';

interface GeneralInfoProps {
  vehicle: Vehicle;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({ vehicle }) => {
  const {
    brand,
    manufacturingYear,
    numberOfAxles,
    registration,
    registrationDate,
    registrationExpiryDate,
    emptyWeight,
  } = vehicle;

  const formattedRegistrationDate = new Date(registrationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedRegistrationExpiryDate = new Date(registrationExpiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text variant="text-l-medium" color="text-color-2">
        General Info
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Model" value={brand} />
        <InfoItem label="Manufacturing Year" value={manufacturingYear} />
        <InfoItem label="Number of Axels" value={numberOfAxles} />
        <InfoItem label="Curb weight (kg)" value={emptyWeight} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Registration Plate" value={registration} />
        <InfoItem label="Registration Date" value={formattedRegistrationDate} />
        <InfoItem label="Registration Expires" value={formattedRegistrationExpiryDate} />
      </FlexLayout>
    </FlexLayout>
  );
};

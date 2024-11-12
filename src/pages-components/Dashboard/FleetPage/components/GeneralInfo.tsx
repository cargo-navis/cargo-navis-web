import { InfoItem } from '@/components/InfoItem';
import { Vehicle, VehicleEnum } from '@/lib/api';
import { useAlertByVehicleType } from '@/lib/hooks';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { DisplayIf, Divider, FlexLayout, Text } from '@/ui';

interface GeneralInfoProps {
  vehicle: Vehicle;
}

export const GeneralInfo: React.FC<GeneralInfoProps> = ({ vehicle }) => {
  const {
    id,
    type,
    brand,
    manufacturingYear,
    numberOfAxles,
    registration,
    registrationDate,
    registrationExpiryDate,
    emptyWeight,
    technicalInspectionExpiryDate,
    tachographExpiryDate
  } = vehicle;

  const { data } = useAlertByVehicleType(type);
  const vehicleAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = vehicleAlerts?.map((va) => ruleToPropertyMap[va.ruleName]);

  const formattedRegistrationDate = registrationDate
    ? new Date(registrationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedRegistrationExpiryDate = registrationExpiryDate
    ? new Date(registrationExpiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const techExpiryDate = technicalInspectionExpiryDate
    ? new Date(technicalInspectionExpiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : '-';

  const tachoExpiryDate = tachographExpiryDate
    ? new Date(tachographExpiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : '-';

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text variant="text-l-medium" color="text-color-2">
        General Info
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Brand" value={brand} />
        <InfoItem label="Manufacturing Year" value={manufacturingYear} />
        <InfoItem label="Number of Axels" value={numberOfAxles} />
        <InfoItem label="Curb weight (kg)" value={emptyWeight} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Registration Plate" value={registration} />
        <InfoItem label="Registration Date" value={formattedRegistrationDate} />
        <InfoItem
          label="Registration - Expiry Date"
          value={formattedRegistrationExpiryDate}
          isAlert={propertiesWithAlert?.includes('registrationExpiryDate')}
        />
      </FlexLayout>
      <Divider />
      <DisplayIf condition={type !== VehicleEnum.TRAILER}>
        <InfoItem label="Tachograph - Expiry Date" value={tachoExpiryDate} />
      </DisplayIf>
      <InfoItem label="Technical Inspection - Expiry Date" value={techExpiryDate} />
    </FlexLayout>
  );
};

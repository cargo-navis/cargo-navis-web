import { InfoItem } from '@/components/InfoItem';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { useAlertByVehicleType } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
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
    tachographExpiryDate,
    technicalInspectionExpiryDate,
    periodicalTechnicalInspectionExpiryDate,
    smallServiceExpiryDate,
    bigServiceExpiryDate,
    tiresSeasonalReplacementExpiryDate,
    insuranceExpiryDate,
    leasingExpiryDate,
  } = vehicle;

  const { data } = useAlertByVehicleType(type);
  const vehicleAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = vehicleAlerts?.map((va) => ruleToPropertyMap[va.ruleName]);

  const formattedRegistrationDate = getDataPointDateString(registrationDate);
  const formattedRegistrationExpiryDate = getDataPointDateString(registrationExpiryDate);

  const tachoExpiryDate = getDataPointDateString(tachographExpiryDate);

  const techExpiryDate = getDataPointDateString(technicalInspectionExpiryDate);
  const periodicalTechExpiryDate = getDataPointDateString(periodicalTechnicalInspectionExpiryDate);

  const smallServiceExpDate = getDataPointDateString(smallServiceExpiryDate);
  const bigServiceExpDate = getDataPointDateString(bigServiceExpiryDate);
  const tiresExpDate = getDataPointDateString(tiresSeasonalReplacementExpiryDate);

  const insuranceExpDate = getDataPointDateString(insuranceExpiryDate);
  const leasingExpDate = getDataPointDateString(leasingExpiryDate);

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
        <InfoItem
          label="Tachograph - Expiry Date"
          value={tachoExpiryDate}
          isAlert={propertiesWithAlert?.includes('tachographExpiryDate')}
        />
        <Divider />
      </DisplayIf>
      <InfoItem
        label="Technical Inspection - Expiry Date"
        value={techExpiryDate}
        isAlert={propertiesWithAlert?.includes('technicalInspectionExpiryDate')}
      />
      <InfoItem
        label="Periodical Technical Inspection - Expiry Date"
        value={periodicalTechExpiryDate}
        isAlert={propertiesWithAlert?.includes('periodicalTechnicalInspectionExpiryDate')}
      />
      <Divider />
      <InfoItem
        label="Small Service - Expiry Date"
        value={smallServiceExpDate}
        isAlert={propertiesWithAlert?.includes('smallServiceExpiryDate')}
      />
      <InfoItem
        label="Big Service - Expiry Date"
        value={bigServiceExpDate}
        isAlert={propertiesWithAlert?.includes('bigServiceExpiryDate')}
      />
      <InfoItem
        label="Tires change - Expiry Date"
        value={tiresExpDate}
        isAlert={propertiesWithAlert?.includes('tiresSeasonalReplacementExpiryDate')}
      />
      <Divider />
      <InfoItem
        label="Insurance - Expiry Date"
        value={insuranceExpDate}
        isAlert={propertiesWithAlert?.includes('insuranceExpiryDate')}
      />
      <InfoItem
        label="Leasing - Expiry Date"
        value={leasingExpDate}
        isAlert={propertiesWithAlert?.includes('leasingExpiryDate')}
      />
    </FlexLayout>
  );
};

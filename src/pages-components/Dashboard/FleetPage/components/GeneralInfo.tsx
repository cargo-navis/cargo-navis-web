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
    tiresReplacementExpiryDate,
    mandatoryInsuranceExpiryDate,
    leasingExpiryDate,
    vehicleIdentificationNumber,
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
  const tiresExpDate = getDataPointDateString(tiresReplacementExpiryDate);

  const insuranceExpDate = getDataPointDateString(mandatoryInsuranceExpiryDate);
  const leasingExpDate = getDataPointDateString(leasingExpiryDate);

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text variant="text-l-medium" color="text-color-2">
        Generalni podaci
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Brend" value={brand} />
        <InfoItem label="Godina proizvodnje" value={manufacturingYear} />
        <InfoItem label="Broj osovina" value={numberOfAxles} />
        <InfoItem label="Masa praznog vozila (kg)" value={emptyWeight} />
        <InfoItem label="Broj šasije" value={vehicleIdentificationNumber} />
      </FlexLayout>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem label="Registracija" value={registration} />
        <InfoItem label="Datum registracije" value={formattedRegistrationDate} />
        <InfoItem
          label="Registracija - Vrijedi do"
          value={formattedRegistrationExpiryDate}
          isAlert={propertiesWithAlert?.includes('registrationExpiryDate')}
        />
      </FlexLayout>
      <Divider />
      <DisplayIf condition={type !== VehicleEnum.TRAILER}>
        <InfoItem
          label="Tahograf - Vrijedi do"
          value={tachoExpiryDate}
          isAlert={propertiesWithAlert?.includes('tachographExpiryDate')}
        />
        <Divider />
      </DisplayIf>
      <InfoItem
        label="Tehnički pregled - Vrijedi do"
        value={techExpiryDate}
        isAlert={propertiesWithAlert?.includes('technicalInspectionExpiryDate')}
      />
      <InfoItem
        label="Periodički tehnički pregled - Vrijedi do"
        value={periodicalTechExpiryDate}
        isAlert={propertiesWithAlert?.includes('periodicalTechnicalInspectionExpiryDate')}
      />
      <Divider />
      <InfoItem
        label="Mali servis - Vrijedi do"
        value={smallServiceExpDate}
        isAlert={propertiesWithAlert?.includes('smallServiceExpiryDate')}
      />
      <InfoItem
        label="Veliki servis - Vrijedi do"
        value={bigServiceExpDate}
        isAlert={propertiesWithAlert?.includes('bigServiceExpiryDate')}
      />
      <InfoItem
        label="Gume - Vrijedi do"
        value={tiresExpDate}
        isAlert={propertiesWithAlert?.includes('tiresReplacementExpiryDate')}
      />
      <Divider />
      <InfoItem
        label="Osiguranje - Vrijedi do"
        value={insuranceExpDate}
        isAlert={propertiesWithAlert?.includes('mandatoryInsuranceExpiryDate')}
      />
      <InfoItem
        label="Kasko - Vrijedi do"
        value={insuranceExpDate}
        isAlert={propertiesWithAlert?.includes('optionalInsuranceExpiryDate')}
      />
      <InfoItem
        label="Leasing - Vrijedi do"
        value={leasingExpDate}
        isAlert={propertiesWithAlert?.includes('leasingExpiryDate')}
      />
    </FlexLayout>
  );
};

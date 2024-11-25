import { InfoItem } from '@/components/InfoItem';
import type { Employee } from '@/lib/api';
import { useEmployeeAlerts } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { CategoryLabel } from '@/pages-components/Dashboard/EmployeesPage/CategoryLabel';
import { Divider, FlexLayout, Text } from '@/ui';
import { countries } from '../NewEmployeePage/const';

interface DriverInfoProps {
  employee: Employee;
}

export const DriverInfo: React.FC<DriverInfoProps> = ({ employee }) => {
  const {
    id,
    governmentId,
    governmentIdExpiryDate,
    nationality,
    driverLicenceId,
    driverLicenceCategories,
    driverLicenceExpiryDate,
    professionalDriverLicenceExpiryDate,
    driverTachographCardId,
    driverTachographCardExpiryDate,
    code95ExpiryDate,
    adrExpiryDate,
    contractExpiryDate,
    visaExpiryDate,
    medicalExaminationExpiryDate,
  } = employee;

  const { data } = useEmployeeAlerts();
  const employeeAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = employeeAlerts?.map((ea) => ruleToPropertyMap[ea.ruleName]);

  const formattedGovIdExpiryDate = getDataPointDateString(governmentIdExpiryDate);

  const formattedDriverLicenceExpiryDate = getDataPointDateString(driverLicenceExpiryDate);
  const formattedProfDriverExpiryDate = getDataPointDateString(professionalDriverLicenceExpiryDate);

  const formattedAdrExpiryDate = getDataPointDateString(adrExpiryDate);
  const formattedCode95ExpiryDate = getDataPointDateString(code95ExpiryDate);

  const formattedContractExpiryDate = getDataPointDateString(contractExpiryDate);
  const formattedVisaExpiryDate = getDataPointDateString(visaExpiryDate);
  const formattedMedicalExaminationExpiryDate = getDataPointDateString(medicalExaminationExpiryDate);

  const tachographExpiryDate = getDataPointDateString(driverTachographCardExpiryDate);

  return (
    <FlexLayout className="flex-col gap-4">
      <Text variant="text-l-medium" color="text-color-2">
        Podaci za vozača
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <FlexLayout className="flex-col gap-3">
          <Text variant="text-m-medium" color="text-color-3">
            Službeni podaci
          </Text>
          <InfoItem label="Broj dokumenta" value={governmentId} />
          <InfoItem
            label="Vrijedi do"
            value={formattedGovIdExpiryDate}
            isAlert={propertiesWithAlert?.includes('governmentIdExpiryDate')}
          />
        </FlexLayout>
        <Divider />
        <FlexLayout className="flex-col gap-3">
          <Text variant="text-m-medium" color="text-color-3">
            Vozačka dozvola
          </Text>
          <InfoItem label="Broj dozvole" value={driverLicenceId ?? '-'} />
          <InfoItem label="Država izdavanja" value={countries.find((c) => c.code === nationality)?.name || '-'} />
          <FlexLayout className="justify-between items-baseline">
            <Text color="text-color-3" variant="text-s-medium">
              Kategorije:
            </Text>
            <FlexLayout className="gap-1">
              {driverLicenceCategories?.map((l: string) => (
                <CategoryLabel category={l} key={l} />
              ))}
            </FlexLayout>
          </FlexLayout>
          <InfoItem
            label="Regularna dozvola - Vrijedi do"
            value={formattedDriverLicenceExpiryDate}
            isAlert={propertiesWithAlert?.includes('driverLicenceExpiryDate')}
          />
          <InfoItem
            label="Profesionalna dozvola - Vrijedi do"
            value={formattedProfDriverExpiryDate}
            isAlert={propertiesWithAlert?.includes('professionalDriverLicenceExpiryDate')}
          />
        </FlexLayout>
        <Divider />
        <InfoItem label="Broj Tahografske kartice" value={driverTachographCardId || '-'} />
        <InfoItem label="Vrijedi do" value={tachographExpiryDate || '-'} />
        <Divider />
        <InfoItem label="ADR - Vrijedi do" value={formattedAdrExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Ugovor o zaposlenju - Vrijedi do" value={formattedContractExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Radna dozvola - Vrijedi do" value={formattedVisaExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Lječnički pregled - Vrijedi do" value={formattedMedicalExaminationExpiryDate || '-'} />
        <Divider />
        <InfoItem
          label="Kod 95 - Vrijedi do"
          value={formattedCode95ExpiryDate}
          isAlert={propertiesWithAlert?.includes('code95ExpiryDate')}
        />
      </FlexLayout>
      <Divider />
    </FlexLayout>
  );
};

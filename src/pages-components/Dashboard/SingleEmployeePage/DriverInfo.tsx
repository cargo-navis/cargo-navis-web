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
        Driver Info
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <FlexLayout className="flex-col gap-3">
          <Text variant="text-m-medium" color="text-color-3">
            Government Info
          </Text>
          <InfoItem label="Government ID" value={governmentId} />
          <InfoItem
            label="ID - Expiry date"
            value={formattedGovIdExpiryDate}
            isAlert={propertiesWithAlert?.includes('governmentIdExpiryDate')}
          />
        </FlexLayout>
        <Divider />
        <FlexLayout className="flex-col gap-3">
          <Text variant="text-m-medium" color="text-color-3">
            Driver&apos;s Licence
          </Text>
          <InfoItem label="Driver's Licence ID" value={driverLicenceId ?? '-'} />
          <InfoItem label="Country of issue" value={countries.find((c) => c.code === nationality)?.name || '-'} />
          <FlexLayout className="justify-between items-baseline">
            <Text color="text-color-3" variant="text-s-medium">
              Driver&apos;s Categories:
            </Text>
            <FlexLayout className="gap-1">
              {driverLicenceCategories?.map((l: string) => (
                <CategoryLabel category={l} key={l} />
              ))}
            </FlexLayout>
          </FlexLayout>
          <InfoItem
            label="Driver's Licence Expiry date"
            value={formattedDriverLicenceExpiryDate}
            isAlert={propertiesWithAlert?.includes('driverLicenceExpiryDate')}
          />
          <InfoItem
            label="Professional Driver's Licence Expiry date"
            value={formattedProfDriverExpiryDate}
            isAlert={propertiesWithAlert?.includes('professionalDriverLicenceExpiryDate')}
          />
        </FlexLayout>
        <Divider />
        <InfoItem label="Tachograph Card ID" value={driverTachographCardId || '-'} />
        <InfoItem label="Tachograph Card Expiry date" value={tachographExpiryDate || '-'} />
        <Divider />
        <InfoItem label="ADR Expiry date" value={formattedAdrExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Employment Contract Expiry date" value={formattedContractExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Work Permit Expiry date" value={formattedVisaExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Medical Exam Expiry date" value={formattedMedicalExaminationExpiryDate || '-'} />
        <Divider />
        <InfoItem
          label="Code 95 Expiry date"
          value={formattedCode95ExpiryDate}
          isAlert={propertiesWithAlert?.includes('code95ExpiryDate')}
        />
      </FlexLayout>
      <Divider />
    </FlexLayout>
  );
};

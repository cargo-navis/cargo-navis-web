import { InfoItem } from '@/components/InfoItem';
import type { Employee } from '@/lib/api';
import { useEmployeeAlerts } from '@/lib/hooks';
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
    driversLicenceId,
    driverLicenceCategories,
    driverLicenceExpiryDate,
    professionalDriverLicenceExpiryDate,
    driverTachographCardId,
    code95ExpiryDate,
    adrExpiryDate,
    contractExpiryDate,
    visaExpiryDate,
    medicalExaminationExpiryDate,
  } = employee;

  const { data } = useEmployeeAlerts();
  const employeeAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = employeeAlerts?.map((ea) => ruleToPropertyMap[ea.ruleName]);

  const formattedGovIdExpiryDate = governmentIdExpiryDate
    ? new Date(governmentIdExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedDriverLicenceExpiryDate = driverLicenceExpiryDate
    ? new Date(driverLicenceExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedProfDriverExpiryDate = professionalDriverLicenceExpiryDate
    ? new Date(professionalDriverLicenceExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedAdrExpiryDate = adrExpiryDate
    ? new Date(adrExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedCode95ExpiryDate = code95ExpiryDate
    ? new Date(code95ExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';
  const formattedContractExpiryDateExpiryDate = contractExpiryDate
    ? new Date(contractExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';
  const formattedVisaExpiryDateExpiryDate = visaExpiryDate
    ? new Date(visaExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';
  const formattedMedicalExaminationExpiryDateExpiryDate = medicalExaminationExpiryDate
    ? new Date(medicalExaminationExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

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
            Driver's Licence
          </Text>
          <InfoItem label="Driver's Licence ID" value={driversLicenceId ?? '-'} />
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
            label="Driver's Licence expiry date"
            value={formattedDriverLicenceExpiryDate}
            isAlert={propertiesWithAlert?.includes('driverLicenceExpiryDate')}
          />
          <InfoItem
            label="Professional Driver's Licence expiry date"
            value={formattedProfDriverExpiryDate}
            isAlert={propertiesWithAlert?.includes('professionalDriverLicenceExpiryDate')}
          />
        </FlexLayout>
        <Divider />
        <InfoItem label="Tachograph Card ID" value={driverTachographCardId || '-'} />
        <Divider />
        <InfoItem label="ADR Expiry date" value={formattedAdrExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Employment Contract Expiry date" value={contractExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Work Permit Expiry date" value={visaExpiryDate || '-'} />
        <Divider />
        <InfoItem label="Medical Exam Expiry date" value={medicalExaminationExpiryDate || '-'} />
        <Divider />
        <InfoItem
          label="Code 95 Expiry Date"
          value={formattedCode95ExpiryDate}
          isAlert={propertiesWithAlert?.includes('code95ExpiryDate')}
        />
      </FlexLayout>
      <Divider />
    </FlexLayout>
  );
};

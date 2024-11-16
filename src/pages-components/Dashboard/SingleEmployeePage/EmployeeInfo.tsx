import type { Employee } from '@/lib/api';
import { useEmployeeAlerts } from '@/lib/hooks';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { Divider, FlexLayout, Text } from '@/ui';

import { InfoItem } from '@/components/InfoItem';

interface GeneralInfoProps {
  employee: Employee;
}

export const EmployeeInfo: React.FC<GeneralInfoProps> = ({ employee }) => {
  const { id, contractExpiryDate, medicalExaminationExpiryDate, visaExpiryDate } = employee;

  const { data } = useEmployeeAlerts();
  const employeeAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = employeeAlerts?.map((ea) => ruleToPropertyMap[ea.ruleName]);

  const formattedContractDate = contractExpiryDate
    ? new Date(contractExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedMedicalExpiryDate = medicalExaminationExpiryDate
    ? new Date(medicalExaminationExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const formattedVisaExpiryDate = visaExpiryDate
    ? new Date(visaExpiryDate).toLocaleDateString('hr-HR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  return (
    <FlexLayout className="flex-col gap-4 w-[460px]">
      <Text variant="text-l-medium" color="text-color-2">
        General Info
      </Text>
      <Divider />
      <FlexLayout className="flex-col gap-3">
        <InfoItem
          label="Contract Expiry Date"
          value={formattedContractDate}
          isAlert={propertiesWithAlert?.includes('contractExpiryDate')}
        />
        <InfoItem
          label="Medical Examination Expiry Date"
          value={formattedMedicalExpiryDate}
          isAlert={propertiesWithAlert?.includes('medicalExaminationExpiryDate')}
        />
        <InfoItem
          label="Work Permit Expiry Date"
          value={formattedVisaExpiryDate}
          isAlert={propertiesWithAlert?.includes('visaExpiryDate')}
        />
      </FlexLayout>
      <Divider />
    </FlexLayout>
  );
};

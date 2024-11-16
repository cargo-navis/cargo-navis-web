import { InfoItem } from '@/components/InfoItem';
import type { Employee } from '@/lib/api';
import { useEmployeeAlerts } from '@/lib/hooks';
import { ruleToPropertyMap } from '@/pages-components/Dashboard/DashboardPage/components/utils';
import { CategoryLabel } from '@/pages-components/Dashboard/EmployeesPage/CategoryLabel';
import { Divider, FlexLayout, Icon, Text } from '@/ui';

interface DriverInfoProps {
  employee: Employee;
}

export const DriverInfo: React.FC<DriverInfoProps> = ({ employee }) => {
  const {
    id,
    driverLicenceCategories,
    driverLicenceExpiryDate,
    professionalDriverLicenceExpiryDate,
    code95ExpiryDate,
  } = employee;

  const { data } = useEmployeeAlerts();
  const employeeAlerts = data?.filter(({ alertable }) => alertable.id === id);

  const propertiesWithAlert = employeeAlerts?.map((ea) => ruleToPropertyMap[ea.ruleName]);

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

  const formattedCode95ExpiryDate = code95ExpiryDate
    ? new Date(code95ExpiryDate).toLocaleDateString('hr-HR', {
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
        <FlexLayout className="justify-between items-baseline">
          <Text color="text-color-3" variant="text-s-medium">
            ADR
          </Text>
          {employee.adr ? (
            <Icon className="text-green-600" icon="CheckCircleIcon" size="l" />
          ) : (
            <Icon className="text-red-500" icon="XCircleIcon" size="l" />
          )}
        </FlexLayout>
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

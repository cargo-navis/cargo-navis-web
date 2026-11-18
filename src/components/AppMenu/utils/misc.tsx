import { useEmployee } from '@/lib/hooks';
import { FlexLayout, Icon, Text } from '@/ui';

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

/** Driver initials (or an info icon) next to a notification on Početna (old look, until the Početna redesign). */
export function NotificationAvatar({ driverId }: { driverId?: string }) {
  const { data: employee } = useEmployee(driverId ?? '');

  return (
    <FlexLayout className="shrink-0 items-center justify-center size-[36px] rounded-legacy-circle bg-legacy-blue-100 text-legacy-blue-600 dark:bg-legacy-blue-500/20 dark:text-legacy-blue-300">
      {driverId && employee ? (
        <Text variant="text-xs-bold">{getInitials(employee.firstName, employee.lastName)}</Text>
      ) : (
        <Icon icon="IconInfoCircle" size="l" />
      )}
    </FlexLayout>
  );
}

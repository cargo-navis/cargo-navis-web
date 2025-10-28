import type { User } from '@/lib/api/user.d';
import { Box, FlexLayout, Text } from '@/ui';
import { TextInputWithLabels } from '@/ui/hocs';

import { OccupationPill } from '../EmployeesPage/OccupationPill';

export const UserProfileSection: React.FC<{ user: User }> = ({ user }) => {
  return (
    <FlexLayout className="flex-col gap-4">
      <Text color="text-color-2" variant="text-m-medium">
        Podaci o korisniku
      </Text>
      <FlexLayout className="flex-col gap-3">
        <Text color="text-color-1" variant="text-xxl-bold">
          {user.firstName} {user.lastName}
        </Text>
        <FlexLayout className="items-center gap-2">
          {user.positions.map((position) => (
            <OccupationPill key={position} occupation={position} text={position} />
          ))}
        </FlexLayout>
      </FlexLayout>
      <Box>
        <TextInputWithLabels
          iconLeft="LockClosedIcon"
          isDisabled
          label="Email"
          value={user.email}
          onChange={() => null}
        />
      </Box>
    </FlexLayout>
  );
};

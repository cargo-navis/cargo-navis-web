import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { User } from '@/lib/api/user.d';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentUser } from '@/lib/hooks';
import { OccupationPill } from '@/pages-components/Dashboard/EmployeesPage/OccupationPill';
import { Box, FlexLayout, Text } from '@/ui';
import { TextInputWithLabels } from '@/ui/hocs';

export const UserProfilePage = () => {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <DashboardLayout>
      {!user || isLoading ? (
        <LoadingPage />
      ) : (
        <Box>
          <MainContent user={user} />
        </Box>
      )}
    </DashboardLayout>
  );
};

export const MainContent: React.FC<{ user: User }> = ({ user }) => {
  return (
    <FlexLayout className="flex-col gap-4 max-w-[400px]">
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

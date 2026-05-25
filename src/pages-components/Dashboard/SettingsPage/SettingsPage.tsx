import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useCurrentUser } from '@/lib/hooks';
import { FlexLayout, Heading } from '@/ui';

import { ContentLoader } from './ContentLoader';
import { PasswordUpdateForm } from './PasswordUpdateForm';
import { UserProfileSection } from './UserProfileSection';

export const SettingsPage = () => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTitle title="Postavke" />
      <FlexLayout className="flex-col gap-8">
        <FlexLayout className=" flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Postavke
          </Heading>
        </FlexLayout>
        <FlexLayout className="flex-col gap-[40px] w-[480px]">
          <UserProfileSection user={user} />
          <PasswordUpdateForm />
        </FlexLayout>
      </FlexLayout>
    </DashboardLayout>
  );
};

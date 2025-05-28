import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FlexLayout, Heading } from '@/ui';

import { PasswordUpdateForm } from './PasswordUpdateForm';

export const SettingsPage = () => {
  return (
    <DashboardLayout>
      <FlexLayout className="flex-col gap-8">
        <FlexLayout className=" flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Postavke
          </Heading>
        </FlexLayout>
        <FlexLayout className="flex-col gap-[40px]">
          <PasswordUpdateForm />
        </FlexLayout>
      </FlexLayout>
    </DashboardLayout>
  );
};

import { PageTitle } from '@/components/PageTitle';
import { FlexLayout, Heading, Text } from '@/ui';

import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  //

  return (
    <FlexLayout className="h-screen flex-row">
      <PageTitle title="Prijava" />
      <FlexLayout as="main" className="flex-col flex-grow p-5 md:p-7 justify-center items-center bg-sidebar-gradient">
        <Heading as="h1" className="text-center -mt-10 mb-9" variant="text-xl">
          CargoNavis
        </Heading>
        <FlexLayout className="w-full md:w-[482px] bg-gradient-to-bl from-teal-50 to-white to-50% dark:from-teal-900 dark:to-dark-900 flex-col p-6 md:px-8 md:py-7 rounded-xl gap-7 shadow-lg">
          <FlexLayout className="flex-col gap-2">
            <Text as="h2" color="text-color-1" variant="text-xl-medium">
              Prijava
            </Text>
            <Text color="text-color-2" variant="text-xs">
              Dobro došli natrag!
            </Text>
          </FlexLayout>
          <LoginForm />
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

import { useRouter } from 'next/router';

import { PageTitle } from '@/components/PageTitle';
import { FlexLayout, Heading, Text } from '@/ui';

import { InvalidLinkAlert } from './InvalidLinkAlert';
import { SetPasswordForm } from './SetPasswordForm';

export const SetPasswordPage = () => {
  const { isReady, query } = useRouter();

  const token = typeof query.token === 'string' ? query.token : '';
  const email = typeof query.email === 'string' ? query.email : '';

  return (
    <FlexLayout className="h-screen flex-row">
      <PageTitle title="Postavljanje lozinke" />
      <FlexLayout as="main" className="flex-col flex-grow p-5 md:p-7 justify-center items-center bg-sidebar-gradient">
        <Heading as="h1" className="text-center -mt-10 mb-9" variant="text-xl">
          CargoNavis
        </Heading>
        <FlexLayout className="w-full md:w-[640px] bg-gradient-to-bl from-teal-50 to-white to-50% dark:from-teal-900 dark:to-dark-900 flex-col p-6 md:px-8 md:py-7 rounded-xl gap-6 shadow-lg">
          <FlexLayout className="flex-col gap-2">
            <Text as="h2" color="text-color-1" variant="text-xl-medium">
              Postavljanje lozinke
            </Text>
            <Text color="text-color-2" variant="text-xs">
              {email ? (
                <>
                  Postavite lozinku za račun:{' '}
                  <Text color="text-color-1" variant="text-xs-medium">
                    {email}
                  </Text>
                </>
              ) : (
                'Postavite lozinku za svoj račun'
              )}
            </Text>
          </FlexLayout>
          {isReady && (token ? <SetPasswordForm token={token} /> : <InvalidLinkAlert />)}
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

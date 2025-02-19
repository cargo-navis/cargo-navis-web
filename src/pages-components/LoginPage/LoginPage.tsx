import type { GetServerSideProps } from 'next';

import { FlexLayout, Heading, Text } from '@/ui';

import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  //

  return (
    <FlexLayout className="h-screen flex-row">
      <FlexLayout as="main" className="flex-col flex-grow p-5 md:p-7 justify-center items-center bg-sidebar-gradient">
        <Heading as="h1" className="text-center -mt-10 mb-9" variant="text-xl">
          CargoNavis
        </Heading>
        <FlexLayout className="bg-gradient-to-bl from-teal-50 to-white to-50% dark:from-teal-900 dark:to-dark-900 flex-col px-8 py-7 rounded-xl gap-7 shadow-lg">
          <FlexLayout className="flex-col gap-2">
            <Text as="h2" color="text-color-1" variant="text-xl-medium">
              Log in
            </Text>
            <Text color="text-color-2" variant="text-xs">
              Welcome back! We are happy to have you here again.
            </Text>
          </FlexLayout>
          <LoginForm />
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // const session = await getServerSession(context.req, context.res, authOptions);

  // TODO - redirect if access-token is present
  const session = null;

  if (session) {
    // Redirect to the home page if the user is already logged in
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  // If no session, render the login page
  return { props: {} };
};

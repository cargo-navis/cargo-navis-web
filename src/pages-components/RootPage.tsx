import { LoadingPage } from '@/lib/components/LoadingPage';
import { ACCESS_TOKEN_KEY } from '@/lib/utils/session';
import { FlexLayout } from '@/ui';
import { GetServerSideProps, NextPage } from 'next';

export const RootPage: NextPage = () => {
  return (
    <FlexLayout className="w-full h-screen">
      <LoadingPage />
    </FlexLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req: { cookies } }) => {
  const accessToken = cookies[ACCESS_TOKEN_KEY];
  const redirectDestination = accessToken ? '/dashboard' : '/login';

  return {
    redirect: { destination: redirectDestination },
    props: {},
  }
};
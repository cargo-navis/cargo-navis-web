import * as React from 'react';

import { AuthHeader, AuthLayout, waitForAuthLeave } from '@/components/layout/AuthLayout';

import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  const [leaving, setLeaving] = React.useState(false);

  return (
    <AuthLayout leaving={leaving} pageTitle="Prijava">
      <AuthHeader description="Dobro došli natrag!" title="Prijava" />
      <LoginForm
        onLeave={() => {
          setLeaving(true);
          return waitForAuthLeave();
        }}
      />
    </AuthLayout>
  );
};

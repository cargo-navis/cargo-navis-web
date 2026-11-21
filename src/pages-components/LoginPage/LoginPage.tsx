import { AuthHeader, AuthLayout } from '@/components/layout/AuthLayout';

import { LoginForm } from './LoginForm';

export const LoginPage = () => (
  <AuthLayout pageTitle="Prijava">
    <AuthHeader description="Dobro došli natrag!" title="Prijava" />
    <LoginForm />
  </AuthLayout>
);

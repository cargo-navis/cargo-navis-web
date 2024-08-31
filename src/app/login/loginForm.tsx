'use client';

import { FormTextInput } from '@/lib/components/form';
import { Button, FlexLayout } from '@/ui';
import { FormProvider, useForm } from 'react-hook-form';

export const LoginForm = () => {
  const formMethods = useForm();

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-6">
        <FormTextInput name="email" label="Email" placeholder="Enter your email" type="email"  />
        <FormTextInput name="password" label="Password" placeholder="Enter your password" type="password" />
        <Button text="Log in" size="l" isFullWidth />
      </FlexLayout>
    </FormProvider>
  );
};
import { FormTextInput } from '@/lib/components/form';
import { Button, FlexLayout } from '@/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { FormValues } from './types';

export const loginSchema = object({
  email: string().email('Must be a valid email').required('Email is required'),
  password: string().required('Password is required'),
});

export const LoginForm = () => {
  const formMethods = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
    mode: 'onBlur'
  });


  const { formState, handleSubmit } = formMethods;
  const { isSubmitting, isValid } = formState;

  async function onSubmit(formValues: FormValues) {
    // await login-old(formValues as any);
  }

  return (
    <FormProvider {...formMethods}>
      {/*<FlexLayout as="form" className="flex-col gap-6" action={action}>*/}
      <FlexLayout as="form" className="flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <FormTextInput autoFocus name="email" label="Email" placeholder="Enter your email" type="email"  />
        <FormTextInput name="password" label="Password" placeholder="Enter your password" type="password" />
        <Button isLoading={isSubmitting} isDisabled={!isValid} text="Log in" size="l" isFullWidth />
      </FlexLayout>
    </FormProvider>
  );
};
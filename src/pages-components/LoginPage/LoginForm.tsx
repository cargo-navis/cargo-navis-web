import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { FormTextInput } from '@/lib/components/form';
import { useLogin } from '@/lib/hooks/api/auth';
import { Button, FlexLayout } from '@/ui';

import type { FormValues } from './types';

export const loginSchema = object({
  email: string().email('Must be a valid email').required('Email is required'),
  password: string().required('Password is required'),
});

export const LoginForm = () => {
  const { push } = useRouter();
  const { loginUser } = useLogin();

  const formMethods = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const { formState, handleSubmit } = formMethods;
  const { isSubmitting, isValid } = formState;

  async function handleFormSubmit(formValues: FormValues) {
    try {
      await loginUser({ ...formValues });
      push('/dashboard/employees');
    } catch (e) {
      alert("We couldn't find anyone with that email and password combination.");
    }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
        <FormTextInput autoFocus label="Email" name="email" placeholder="Enter your email" type="email" />
        <FormTextInput label="Password" name="password" placeholder="Enter your password" type="password" />
        <Button isDisabled={!isValid} isFullWidth isLoading={isSubmitting} size="l" text="Log in" />
      </FlexLayout>
    </FormProvider>
  );
};

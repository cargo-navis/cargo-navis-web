import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { FormPasswordInput, FormTextInput } from '@/lib/components/form';
import { useLogin } from '@/lib/hooks/api/auth';
import { showErrorToast } from '@/lib/utils/toast';
import { Button, FlexLayout } from '@/ui';

import type { FormValues } from './types';

export const loginSchema = object({
  email: string().email('Email mora biti valjanog formata').required('Email je obavezan'),
  password: string().required('Lozinka je obavezna'),
});

export const LoginForm = () => {
  const { push } = useRouter();
  const { loginUser } = useLogin();

  const formMethods = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  const { formState, handleSubmit } = formMethods;
  const { isSubmitting, isValid } = formState;

  async function handleFormSubmit(formValues: FormValues) {
    try {
      await loginUser({ ...formValues });
      await push('/dashboard');
    } catch {
      showErrorToast({ title: 'Nismo pronašli nijednog korisnika s tom kombinacijom emaila i lozinke.' });
    }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
        <FormTextInput autoFocus label="Email" name="email" placeholder="Unesite svoj email" type="email" />
        <FormPasswordInput label="Lozinka" name="password" placeholder="Unesite svoju lozinku" />
        <Button isDisabled={!isValid} isFullWidth isLoading={isSubmitting} size="l" text="Prijava" />
      </FlexLayout>
    </FormProvider>
  );
};

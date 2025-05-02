import { addToast } from '@heroui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { FormTextInput } from '@/lib/components/form';
import { useLogin } from '@/lib/hooks/api/auth';
import { Button, FlexLayout, Icon } from '@/ui';

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
    mode: 'onBlur',
  });

  const { formState, handleSubmit } = formMethods;
  const { isSubmitting, isValid } = formState;

  async function handleFormSubmit(formValues: FormValues) {
    try {
      await loginUser({ ...formValues });
      push('/dashboard/employees');
    } catch {
      addToast({
        title: 'Nismo pronašli nijednog korisnika s tom kombinacijom emaila i lozinke.',
        classNames: {
          base: 'bg-red-600 dark:bg-red-700 text-white border border-red-600',
          content: 'text-white',
          description: 'text-white',
          title: 'text-white',
          closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
        },
        timeout: 2500,
        radius: 'sm',
        icon: <Icon color="text-white" icon="ExclamationTriangleIcon" size="xl" />,
        closeIcon: (
          <FlexLayout className="bg-red-600 dark:bg-red-700 p-1 items-center justify-center">
            <Icon color="text-white" icon="XMarkIcon" size="l" />
          </FlexLayout>
        ),
      });
    }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
        <FormTextInput autoFocus label="Email" name="email" placeholder="Unesite svoj email" type="email" />
        <FormTextInput label="Lozinka" name="password" placeholder="Unesite svoju lozinku" type="password" />
        <Button isDisabled={!isValid} isFullWidth isLoading={isSubmitting} size="l" text="Prijava" />
      </FlexLayout>
    </FormProvider>
  );
};

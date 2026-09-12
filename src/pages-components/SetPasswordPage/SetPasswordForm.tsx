import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { object, ref, string } from 'yup';

import { acceptInvite } from '@/lib/api';
import { FormPasswordInput } from '@/lib/components/form';
import { showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout } from '@/ui';

import { InvalidLinkAlert } from './InvalidLinkAlert';
import type { FormValues } from './types';

const setPasswordSchema = object({
  newPassword: string().required('Lozinka je obavezna').min(8, 'Lozinka mora imati najmanje 8 znakova'),
  confirmPassword: string()
    .required('Potvrda lozinke je obavezna')
    .oneOf([ref('newPassword')], 'Lozinke se ne podudaraju'),
});

interface SetPasswordFormProps {
  token: string;
}

export const SetPasswordForm = ({ token }: SetPasswordFormProps) => {
  const { push } = useRouter();
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);

  const formMethods = useForm<FormValues>({
    defaultValues: { newPassword: '', confirmPassword: '' },
    resolver: yupResolver(setPasswordSchema),
    mode: 'onChange',
  });

  const { formState, handleSubmit } = formMethods;
  const { isSubmitting, isValid } = formState;

  async function handleFormSubmit({ newPassword }: FormValues) {
    try {
      await acceptInvite({ token, newPassword });
      showSuccessToast({ title: 'Lozinka uspješno postavljena, možete se prijaviti', timeout: 5000 });
      await push('/login');
    } catch {
      setIsLinkInvalid(true);
    }
  }

  if (isLinkInvalid) {
    return <InvalidLinkAlert />;
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
        <FormPasswordInput autoFocus label="Nova lozinka" name="newPassword" placeholder="Unesite novu lozinku" />
        <FormPasswordInput label="Potvrda lozinke" name="confirmPassword" placeholder="Potvrdite unesenu lozinku" />
        <Button isDisabled={!isValid} isFullWidth isLoading={isSubmitting} size="l" text="Postavi lozinku" />
      </FlexLayout>
    </FormProvider>
  );
};

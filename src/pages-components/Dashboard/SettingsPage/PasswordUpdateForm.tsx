import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, ref, string } from 'yup';

import { updatePassword } from '@/lib/api/user';
import { FormTextInput } from '@/lib/components/form';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Text } from '@/ui';

interface PasswordUpdateFormData {
  newPassword: string;
  confirmPassword: string;
}

const passwordUpdateSchema = object({
  newPassword: string()
    .required('Nova lozinka je obavezna')
    .min(10, 'Lozinka mora imati najmanje 10 znakova')
    .matches(/[A-Z]/, 'Lozinka mora sadržavati najmanje jedno veliko slovo')
    .matches(/[a-z]/, 'Lozinka mora sadržavati najmanje jedno malo slovo')
    .matches(/[0-9]/, 'Lozinka mora sadržavati najmanje jednu znamenku'),
  confirmPassword: string()
    .required('Potvrda lozinke je obavezna')
    .oneOf([ref('newPassword')], 'Lozinke se ne podudaraju'),
});

export const PasswordUpdateForm = () => {
  const formMethods = useForm<PasswordUpdateFormData>({
    defaultValues: { newPassword: '', confirmPassword: '' },
    resolver: yupResolver(passwordUpdateSchema),
    mode: 'onBlur',
  });

  const { handleSubmit, formState } = formMethods;
  const { isSubmitting, isValid } = formState;

  async function handleFormSubmit({ newPassword }: PasswordUpdateFormData) {
    try {
      await updatePassword(newPassword);
      showSuccessToast({ title: 'Lozinka uspješno ažurirana.' });
      formMethods.reset();
    } catch {
      showErrorToast({ title: 'Dogodila se greška s ažuriranjem lozinke. Pokušajte ponovno.' });
    }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-4 w-[480px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <Text color="text-color-2" variant="text-m-medium">
          Ažuriranje lozinke
        </Text>
        <FlexLayout className="flex-col gap-3">
          <Box>
            <FormTextInput label="Nova lozinka" name="newPassword" placeholder="Unesite novu lozinku" type="password" />
          </Box>
          <Box>
            <FormTextInput
              label="Potvrda nove lozinke"
              name="confirmPassword"
              placeholder="Potvrdite unesenu lozinku"
              type="password"
            />
          </Box>
          <Button isDisabled={!isValid} isFullWidth isLoading={isSubmitting} size="l" text="Ažuriraj lozinku" />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};

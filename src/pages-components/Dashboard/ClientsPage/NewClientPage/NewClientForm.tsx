import 'dayjs/locale/hr';
import type { Client } from '@/lib/api';
import { FormProvider, useForm } from 'react-hook-form';
import '@mantine/dates/styles.css';
import { FormTextInput } from '@/lib/components/form';
import { Box, Button, FlexLayout, Text } from '@/ui';

export const NewClientForm: React.FC<{ client?: Client }> = ({ client }) => {
  // const { push } = useRouter();
  const isEdit = !!client;
  //
  // const { mutateAsync: createEmployee } = useCreateEmployee();
  // const { mutateAsync: updateEmployee } = useUpdateEmployee(employee?.id as string);
  //
  const defaultValues = client ? { ...client } : {};
  //
  const formMethods = useForm<any>({
    defaultValues,
    // resolver: yupResolver(employeeSchema),
    mode: 'all',
  });
  //
  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;

  async function handleFormSubmit(data: any) {
    console.log(data);
    //   const processedData = replaceEmptyStringsWithNull(updatedData);
    //
    //   try {
    //     if (isEdit) {
    //       await updateEmployee(processedData);
    //       await push(`/dashboard/employees/${employee.id}`);
    //     } else {
    //       await createEmployee(processedData);
    //       await push('/dashboard/employees');
    //     }
    //   } catch (error: any) {
    //   }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="flex-col gap-4 w-[480px]">
          <FormTextInput name="name" label="Ime *" />
          <FlexLayout className="gap-2">
            <Box className="flex-1">
              <FormTextInput name="vatNumber" label="VAT *" />
            </Box>
            <Box className="flex-1">
              <FormTextInput name="nationalCompanyRegisterId" label="OIB *" />
            </Box>
          </FlexLayout>
          <FlexLayout className="flex-1 flex-col gap-2">
            <Text color="text-color-3" variant="text-xxs-medium">
              Adresa sjedišta
            </Text>
            <FormTextInput name="address.name" label="Ulica i broj" />
            <FlexLayout className="gap-2">
              <Box className="flex-1">
                <FormTextInput name="address.postalCode" label="Poštanski broj" />
              </Box>
              <Box className="flex-1">
                <FormTextInput name="address.city" label="Grad" />
              </Box>
            </FlexLayout>
            <FormTextInput name="address.country" label="Država" />
          </FlexLayout>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            text={isEdit ? 'Ažuriraj Klijenta' : 'Dodaj Klijenta'}
            isFullWidth
            isDisabled={!(isValid && isDirty)}
            isLoading={formState.isSubmitting}
          />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};

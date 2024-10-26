import 'dayjs/locale/hr';
import { Vehicle } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form/FormSingleSelect';
import { FormProvider, useForm } from 'react-hook-form';

import '@mantine/dates/styles.css';
import { FormDatepicker, FormTextInput } from '@/lib/components/form';
import { Box, Button, FlexLayout, Text } from '@/ui';

import { formDefaultValues, vehicleModelOptions } from './const';

export const NewVehicleForm: React.FC<{ vehicle?: Vehicle }> = ({ vehicle }) => {
  const isEdit = !!vehicle;

  const defaultValues = vehicle ? { ...vehicle } : formDefaultValues;

  const formMethods = useForm({
    defaultValues,
    // resolver: yupResolver(employeeSchema),
    mode: 'all',
  });

  const { watch, handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;
  const values = watch();

  async function handleFormSubmit(data: any) {
    console.log(data);
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="flex-col gap-4 w-[480px]">
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormSingleSelect
                label="Brand"
                name="brand"
                isSearchable
                isClearable
                options={vehicleModelOptions}
                placeholder="Select brand..."
              />
            </Box>
            <Box className="flex-1">
              {/* TODO - create new Yearpicker UI and form component */}
              <FormDatepicker name="manufacturingYear" label="Manufacturing Year" />
             </Box>
          </FlexLayout>
          <Box>
            <FormTextInput name="registration" label="Registration plate" />
          </Box>
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormDatepicker name="registrationDate" label="Registration date" />
            </Box>
            <Box className="flex-grow">
              <FormDatepicker name="registrationExpiryDate" label="Registration expiry date" />
            </Box>
          </FlexLayout>
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormTextInput name="emptyWeight" label="Curb Weight" type="number"/>
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="numberOfAxles" label="Number of Axels" type="number"/>
            </Box>
          </FlexLayout>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            text={isEdit ? 'Update Truck' : 'Create Truck'}
            isFullWidth
            isDisabled={!(isValid && isDirty)}
            isLoading={formState.isSubmitting}
          />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};

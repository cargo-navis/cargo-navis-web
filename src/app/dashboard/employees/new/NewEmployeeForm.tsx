'use client';

import 'dayjs/locale/hr';
import '@mantine/dates/styles.css';

import { Box } from '@/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { FormCheckboxGroup, FormDatepicker, FormRadioGroup, FormTextInput } from '@/lib/components/form';

const positionOptions = [
  { label: 'Manager', value: 'manager' },
  { label: 'Disponent', value: 'disponent' },
  { label: 'Driver', value: 'driver' },
];

const adrOptions = [
  { label: 'True', value: 'adr_true' },
  { label: 'False', value: 'adr_false' },
];

const categoryOptions = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'B2', value: 'b2' },
  { label: 'C', value: 'c' },
  { label: 'C2', value: 'c2' },
];

const dummyDefaultValues = {
  "first_name": "Kristijan",
  "last_name": "Korac",
  "phone_number": "098 192 8375",
  "email": "korac",
  "gov_id": "HR123456789",
  "position": "driver",
  "categories": [
    "b2",
    "b"
  ],
  "adr": "adr_false",
  "expiry_date": "2024-07-24"
};

export const NewEmployeeForm = () => {
  const formMethods = useForm({
    defaultValues: dummyDefaultValues
  });

  const { watch, handleSubmit } = formMethods;
  const values = watch();

  function handleFormSubmit(data: any) {
    console.log('form submitted');
    console.log(data);
  }

  return (
    <FormProvider {...formMethods}>
      <Box as="form" className="flex flex-col gap-10" onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="flex flex-col gap-4 w-[500px]">
          <Box className="flex gap-4">
            <Box className="flex-grow">
              <FormTextInput name="first_name" label="First Name" />
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="last_name" label="Last Name" />
            </Box>
          </Box>
          <Box>
            <FormTextInput name="phone_number" label="Phone Number" type="tel" />
          </Box>
          <Box>
            <FormTextInput name="email" label="Email" type="email" />
          </Box>
          <Box>
            <FormTextInput name="gov_id" label="Government ID" />
          </Box>
          <FormRadioGroup name="position" label="Position" options={positionOptions} />
          {values?.position === 'driver' && (
            <Box className="flex flex-col gap-4">
              <Box className="flex gap-3">
                <Box className="flex-1">
                  <FormCheckboxGroup name="categories" label="Categories" options={categoryOptions} />
                </Box>
                <Box className="flex-1">
                  <FormRadioGroup name="adr" label="ADR" options={adrOptions} />
                </Box>
              </Box>
              <FormDatepicker name="expiry_date" label="Expiry Date" />
            </Box>
          )}
        </Box>
        <Box as="pre" className="absolute right-[600px]">
          {JSON.stringify(values, null, 2)}
        </Box>
      </Box>
    </FormProvider>
  );
}
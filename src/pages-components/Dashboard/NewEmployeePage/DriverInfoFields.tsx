import { DriverLicenceEnum } from '@/lib/api';
import { FormCheckboxGroup, FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { Box, FlexLayout, Text } from '@/ui';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';
import { categoryOptions, countryOptions } from './const';

export const DriverInfoFields = () => {
  const { watch } = useFormContext();
  const values = watch();

  return (
    <>
      <Box className="w-[1px] border-[0px] border-l-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box className={clsx('w-[480px] relative flex flex-col gap-4')}>
        <Text color="text-color-2" variant="text-l-medium">
          Driver details
        </Text>
        <FlexLayout className="flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Government ID
          </Text>
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormTextInput name="governmentId" label="Government ID" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker name="governmentIdExpiryDate" label="Expiry date" />
            </Box>
          </FlexLayout>
        </FlexLayout>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        {values.driverLicenceCategories && !!values.driverLicenceCategories.length && (
          <>
            <FlexLayout className="flex-col gap-2">
              <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
                Driver&apos;s Licence
              </Text>
              <FormTextInput name="driversLicenceId" label="Driver's Licence ID" />
              <FormSingleSelect
                label="Country of issue"
                name="nationality"
                isSearchable
                isClearable
                options={countryOptions}
                placeholder="Select country..."
              />
              <Box className="flex-1">
                <FormCheckboxGroup name="driverLicenceCategories" label="Categories" options={categoryOptions} />
              </Box>
              {values.driverLicenceCategories.some((cat: DriverLicenceEnum) =>
                [DriverLicenceEnum.B, DriverLicenceEnum.B1].includes(cat),
              ) && <FormDatepicker name="driverLicenceExpiryDate" label="Expiry date (Regular)" />}
              {values.driverLicenceCategories.some((cat: DriverLicenceEnum) =>
                [DriverLicenceEnum.C1, DriverLicenceEnum.C, DriverLicenceEnum.C1E, DriverLicenceEnum.CE].includes(cat),
              ) && <FormDatepicker name="professionalDriverLicenceExpiryDate" label="Expiry date (Professional)" />}
            </FlexLayout>
            <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          </>
        )}
        <Box className="flex-1">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            ADR
          </Text>
          <FormDatepicker name="adrExpiryDate" label="Expiry date" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Employment Contract
          </Text>
          <FormDatepicker name="contractExpiryDate" label="Expiry date" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Medical Exam
          </Text>
          <FormDatepicker name="medicalExaminationExpiryDate" label="Expiry date" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Work Permit
          </Text>
          <FormDatepicker name="visaExpiryDate" label="Expiry date" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Code 95
          </Text>
          <FormDatepicker name="code95ExpiryDate" label="Expiry date" />
        </Box>
      </Box>
    </>
  );
};

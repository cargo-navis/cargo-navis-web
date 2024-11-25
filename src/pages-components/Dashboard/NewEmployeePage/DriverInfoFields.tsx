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
          Podaci za vozača
        </Text>
        <FlexLayout className="flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Službeni dokument
          </Text>
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormTextInput name="governmentId" label="Broj dokumenta" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker name="governmentIdExpiryDate" label="Vrijedi do" />
            </Box>
          </FlexLayout>
        </FlexLayout>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <FlexLayout className="flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Vozačka dozvola
          </Text>
          <FormTextInput name="driverLicenceId" label="Broj dozvole" />
          <FormSingleSelect
            label="Država"
            name="nationality"
            isSearchable
            isClearable
            options={countryOptions}
            placeholder="Select country..."
          />
          <Box className="flex-1">
            <FormCheckboxGroup name="driverLicenceCategories" label="Kategorije" options={categoryOptions} />
          </Box>
          {values.driverLicenceCategories?.some((cat: DriverLicenceEnum) =>
            [DriverLicenceEnum.B, DriverLicenceEnum.B1].includes(cat),
          ) && <FormDatepicker name="driverLicenceExpiryDate" label="Vrijedi do (Regularna)" />}
          {values.driverLicenceCategories?.some((cat: DriverLicenceEnum) =>
            [DriverLicenceEnum.C1, DriverLicenceEnum.C, DriverLicenceEnum.C1E, DriverLicenceEnum.CE].includes(cat),
          ) && <FormDatepicker name="professionalDriverLicenceExpiryDate" label="Vrijedi do (Profesionalna)" />}
        </FlexLayout>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <FlexLayout className="flex-1 flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Tahografska kartica
          </Text>
          <FormTextInput name="driverTachographCardId" label="Broj kartice" />
          <FormDatepicker name="driverTachographCardExpiryDate" label="Vrijedi do" />
        </FlexLayout>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex-1">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            ADR
          </Text>
          <FormDatepicker name="adrExpiryDate" label="Vrijedi do" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Ugovor o zaposlenju
          </Text>
          <FormDatepicker name="contractExpiryDate" label="Vrijedi do" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Radna dozvola
          </Text>
          <FormDatepicker name="visaExpiryDate" label="Vrijedi do" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Lječnički pregled
          </Text>
          <FormDatepicker name="medicalExaminationExpiryDate" label="Vrijedi do" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Kod 95
          </Text>
          <FormDatepicker name="code95ExpiryDate" label="Vrijedi do" />
        </Box>
      </Box>
    </>
  );
};

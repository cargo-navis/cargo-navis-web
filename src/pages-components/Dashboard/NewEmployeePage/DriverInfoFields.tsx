import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';

import { DriverLicenceEnum } from '@/lib/api';
import { FormCheckboxGroup, FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { Box, FlexLayout, Text } from '@/ui';

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
              <FormTextInput label="Broj dokumenta" name="governmentId" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Vrijedi do" name="governmentIdExpiryDate" />
            </Box>
          </FlexLayout>
        </FlexLayout>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <FlexLayout className="flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Vozačka dozvola
          </Text>
          <FormTextInput label="Broj dozvole" name="driverLicenceId" />
          <FormSingleSelect
            isClearable
            isSearchable
            label="Država"
            name="nationality"
            options={countryOptions}
            placeholder="Select country..."
          />
          <Box className="flex-1">
            <FormCheckboxGroup label="Kategorije" name="driverLicenceCategories" options={categoryOptions} />
          </Box>
          {values.driverLicenceCategories?.some((cat: DriverLicenceEnum) =>
            [DriverLicenceEnum.B, DriverLicenceEnum.B1].includes(cat)
          ) && <FormDatepicker label="Vrijedi do (Regularna)" name="driverLicenceExpiryDate" />}
          {values.driverLicenceCategories?.some((cat: DriverLicenceEnum) =>
            [DriverLicenceEnum.C1, DriverLicenceEnum.C, DriverLicenceEnum.C1E, DriverLicenceEnum.CE].includes(cat)
          ) && <FormDatepicker label="Vrijedi do (Profesionalna)" name="professionalDriverLicenceExpiryDate" />}
        </FlexLayout>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <FlexLayout className="flex-1 flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Tahografska kartica
          </Text>
          <FormTextInput label="Broj kartice" name="driverTachographCardId" />
          <FormDatepicker label="Vrijedi do" name="driverTachographCardExpiryDate" />
        </FlexLayout>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex-1">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            ADR
          </Text>
          <FormDatepicker label="Vrijedi do" name="adrExpiryDate" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Ugovor o zaposlenju
          </Text>
          <FormDatepicker label="Vrijedi do" name="contractExpiryDate" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Radna dozvola
          </Text>
          <FormDatepicker label="Vrijedi do" name="visaExpiryDate" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Lječnički pregled
          </Text>
          <FormDatepicker label="Vrijedi do" name="medicalExaminationExpiryDate" />
        </Box>
        <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
        <Box className="flex flex-col gap-2">
          <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
            Kod 95
          </Text>
          <FormDatepicker label="Vrijedi do" name="code95ExpiryDate" />
        </Box>
      </Box>
    </>
  );
};

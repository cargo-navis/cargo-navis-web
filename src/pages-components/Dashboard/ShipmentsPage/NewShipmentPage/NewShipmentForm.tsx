import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import { FormDatepicker, FormSingleSelect, FormTextarea, FormTextInput } from '@/lib/components/form';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Divider, FlexLayout, Text, TextButton } from '@/ui';

import { CargoField } from './CargoField';
import { ClientField } from './ClientField';
import { ContractorField } from './ContractorField';
import { DispatcherField } from './DispatcherField';

interface Address {
  name: string;
  postalCodeId: string;
  countryCode?: string;
}

interface BaseShipmentFields {
  referenceNumber?: string;
  loadingAddress?: Address;
  unloadingAddress?: Address;
  loadingReadyDate?: string;
  loadingDate?: string;
  loadingDescription?: string;
  unloadingDate?: string;
  unloadingDueDate?: string;
  unloadingDescription?: string;
  price?: number;
}

interface Subshipment extends BaseShipmentFields {
  contractorId?: string;
}

interface ShipmentFormData extends BaseShipmentFields {
  orderNo: string;
  clientId?: string;
  dispatcherId?: string;
  cargo: Cargo[];
  subshipments: Subshipment[];
}

const defaultValues: ShipmentFormData = {
  orderNo: '2025/24',
  cargo: [
    {
      weight: undefined,
      description: undefined,
      metadata: {
        type: 'standard',
        palleteType: '120x80',
        palleteAmount: 1,
      },
    },
  ],
  subshipments: [],
};

export interface Cargo {
  weight?: number;
  description?: string;
  metadata: CargoMetadata;
}

export interface CargoMetadata {
  type: 'standard' | 'nonstandard';
  width?: number;
  height?: number;
  length?: number;
  palleteType?: string;
  palleteAmount?: number;
}

export const NewShipmentForm = () => {
  const formMethods = useForm<ShipmentFormData>({
    defaultValues,
    mode: 'all',
  });

  const { watch } = formMethods;
  const cargo = watch('cargo');
  const formValues = watch();

  const { handleSubmit } = formMethods;

  function handleFormSubmit(data: any) {
    console.log(data);
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="flex-col gap-4 w-[640px]">
          <FlexLayout as="fieldset" className="flex-col gap-5">
            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FormTextInput iconLeft="LockClosedIcon" isDisabled label="Broj naloga" name="orderNo" />
              </Box>
              <Box className="flex-1">
                <FormTextInput label="Referentni broj" name="referenceNumber" placeholder="1234" />
              </Box>
            </FlexLayout>
            <Box className="flex-1">
              <DispatcherField />
            </Box>
            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <ClientField />
              </Box>
              <Box className="flex-1">
                <FormTextInput
                  iconLeft="CurrencyEuroIcon"
                  label="Cijena (Euro)"
                  min="0"
                  name="price"
                  placeholder="XXX"
                  type="number"
                />
              </Box>
            </FlexLayout>
          </FlexLayout>
          <Box className="py-4">
            <Divider />
          </Box>
          <FlexLayout className="flex-col gap-4">
            {cargo.map((_, index: number, arr: any[]) => (
              <CargoField cargoLength={arr.length} index={index} key={index} />
            ))}
            <TextButton
              iconLeft="PlusIcon"
              text="Dodaj teret"
              variant="secondary"
              onClick={() =>
                formMethods.setValue('cargo', [
                  ...cargo,
                  {
                    weight: undefined,
                    description: undefined,
                    metadata: {
                      type: 'standard',
                      palleteType: '120x80',
                      palleteAmount: 1,
                    },
                  },
                ])
              }
            />
          </FlexLayout>
          <AddressFields />
          <SubshipmentsFields />
          {/* <TextButton
            iconLeft="PlusIcon"
            text="Dodaj podnalog"
            variant="secondary"
            onClick={() =>
              formMethods.setValue('subshipments', [{ contractor: undefined, 'contractor-price': undefined }])
            }
          /> */}
          {/* <Button iconLeft="PlusIcon" isFullWidth text="Napravi Nalog" /> */}
        </FlexLayout>
      </FlexLayout>

      <Box className="fixed right-4 top-4 w-[400px] p-4 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <Text className="mb-2" variant="text-s-medium">
          Form Data:
        </Text>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(formValues, null, 2)}</pre>
      </Box>
    </FormProvider>
  );
};

const AddressFields = () => {
  const { watch } = useFormContext();
  const loadingCountryCode = watch('loadingAddress.countryCode');
  const unloadingCountryCode = watch('unloadingAddress.countryCode');

  return (
    <FlexLayout as="fieldset" className="flex-col gap-8">
      <FlexLayout className="gap-4">
        <FlexLayout className="flex-1 flex-col gap-4">
          <Text color="text-color-3" variant="text-xxs-medium">
            Detalji utovara
          </Text>
          <FormTextInput name="loadingAddress.name" placeholder="Ulica i broj" />
          <FormSingleSelect
            isSearchable
            label="Država"
            name="loadingAddress.countryCode"
            options={countryEuropeOptions}
          />
          <PostalCodeSelectField
            countryCode={loadingCountryCode}
            iconLeft="MagnifyingGlassIcon"
            isClearable
            isDisabled={!loadingCountryCode}
            label="Poštanski broj"
            name="loadingAddress.postalCodeId"
            placeholder="Odaberi poštanski broj"
          />
          <FormDatepicker label="Datum spremnosti za utovar" name="loadingReadyDate" />
          <FormDatepicker label="Datum utovara" name="loadingDate" />
          <FormTextarea label="Opis utovara" name="loadingDescription" placeholder="Unesite detalje utovara..." />
        </FlexLayout>

        <FlexLayout className="flex-1 flex-col gap-4">
          <Text color="text-color-3" variant="text-xxs-medium">
            Detalji istovara
          </Text>
          <FormTextInput name="unloadingAddress.name" placeholder="Ulica i broj" />
          <FormSingleSelect
            isSearchable
            label="Država"
            name="unloadingAddress.countryCode"
            options={countryEuropeOptions}
          />
          <PostalCodeSelectField
            countryCode={unloadingCountryCode}
            iconLeft="MagnifyingGlassIcon"
            isClearable
            isDisabled={!unloadingCountryCode}
            label="Poštanski broj"
            name="unloadingAddress.postalCodeId"
            placeholder="Odaberi poštanski broj"
          />
          <FormDatepicker label="Datum istovara" name="unloadingDate" />
          <FormDatepicker label="Krajnji rok istovara" name="unloadingDueDate" />
          <FormTextarea label="Opis istovara" name="unloadingDescription" placeholder="Unesite detalje istovara..." />
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

const SubshipmentsFields = () => {
  const { watch } = useFormContext();
  const subshipments = watch('subshipments');

  return (
    <FlexLayout className="flex-col gap-8">
      {subshipments.map((sub: any, index: number) => {
        const loadingCountryCode = watch(`subshipments.${index}.loadingAddress.countryCode`);
        const unloadingCountryCode = watch(`subshipments.${index}.unloadingAddress.countryCode`);

        return (
          <FlexLayout
            as="fieldset"
            className="flex-col gap-4 p-4 rounded-s bg-black-alpha-10 dark:bg-white-alpha-10"
            key={index}
          >
            <FlexLayout className="gap-4">
              <Box className="flex-1">
                <FormTextInput
                  label="Referentni broj"
                  name={`subshipments.${index}.referenceNumber`}
                  placeholder="Unesite referencu..."
                />
              </Box>
              <Box className="flex-1">
                <ContractorField name={`subshipments.${index}.contractorId`} />
              </Box>
              <Box className="flex-1">
                <FormTextInput
                  iconLeft="CurrencyEuroIcon"
                  label="Price (Euro)"
                  min="0"
                  name={`subshipments.${index}.price`}
                  placeholder="XXX"
                  type="number"
                />
              </Box>
            </FlexLayout>

            <FlexLayout className="gap-4">
              <FlexLayout className="flex-1 flex-col gap-4">
                <Text color="text-color-3" variant="text-xxs-medium">
                  Detalji utovara
                </Text>
                <FormTextInput name={`subshipments.${index}.loadingAddress.name`} placeholder="Ulica i broj" />
                <FormSingleSelect
                  isSearchable
                  label="Država"
                  name={`subshipments.${index}.loadingAddress.countryCode`}
                  options={countryEuropeOptions}
                />
                <PostalCodeSelectField
                  countryCode={loadingCountryCode}
                  iconLeft="MagnifyingGlassIcon"
                  isClearable
                  isDisabled={!loadingCountryCode}
                  label="Poštanski broj"
                  name={`subshipments.${index}.loadingAddress.postalCodeId`}
                  placeholder="Odaberi poštanski broj"
                />
                <FormDatepicker label="Datum spremnosti za utovar" name={`subshipments.${index}.loadingReadyDate`} />
                <FormDatepicker label="Datum utovara" name={`subshipments.${index}.loadingDate`} />
                <FormTextarea
                  label="Opis utovara"
                  name={`subshipments.${index}.loadingDescription`}
                  placeholder="Unesite detalje utovara..."
                />
              </FlexLayout>

              <FlexLayout className="flex-1 flex-col gap-4">
                <Text color="text-color-3" variant="text-xxs-medium">
                  Detalji istovara
                </Text>
                <FormTextInput name={`subshipments.${index}.unloadingAddress.name`} placeholder="Ulica i broj" />
                <FormSingleSelect
                  isSearchable
                  label="Država"
                  name={`subshipments.${index}.unloadingAddress.countryCode`}
                  options={countryEuropeOptions}
                />
                <PostalCodeSelectField
                  countryCode={unloadingCountryCode}
                  iconLeft="MagnifyingGlassIcon"
                  isClearable
                  isDisabled={!unloadingCountryCode}
                  label="Poštanski broj"
                  name={`subshipments.${index}.unloadingAddress.postalCodeId`}
                  placeholder="Odaberi poštanski broj"
                />
                <FormDatepicker label="Datum istovara" name={`subshipments.${index}.unloadingDate`} />
                <FormDatepicker label="Krajnji rok istovara" name={`subshipments.${index}.unloadingDueDate`} />
                <FormTextarea
                  label="Opis istovara"
                  name={`subshipments.${index}.unloadingDescription`}
                  placeholder="Unesite detalje istovara..."
                />
              </FlexLayout>
            </FlexLayout>
          </FlexLayout>
        );
      })}
    </FlexLayout>
  );
};
